const baseController = require('../../../core/baseController');
const RateSetting = require('./model');
const { Op } = require('sequelize');

class RateSettingController extends baseController {
    constructor() {
        super();
    }

    // تابع کمکی برای بررسی تداخل بازه‌های زمانی
    async checkDateOverlap(startDate, endDate, excludeId = null) {
        const whereClause = {
            startDate: { [Op.lte]: endDate || '9999-12-31' },
            [Op.or]: [
                { endDate: { [Op.gte]: startDate } },
                { endDate: null }
            ]
        };

        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId };
        }

        return await RateSetting.findOne({ where: whereClause });
    }

    // تابع کمکی برای بررسی تداخل با نرخ‌های فعال
    async checkActiveDateOverlap(startDate, endDate, excludeId = null) {
        const whereClause = {
            startDate: { [Op.lte]: endDate || '9999-12-31' },
            [Op.or]: [
                { endDate: { [Op.gte]: startDate } },
                { endDate: null }
            ],
            isActive: true
        };

        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId };
        }

        return await RateSetting.findOne({ where: whereClause });
    }

    async getAll(req, res) {
        try {
            const rateSettings = await RateSetting.findAll({
                order: [['startDate', 'DESC']]
            });
            
            // اضافه کردن اطلاعات اضافی برای هر نرخ
            const ratesWithInfo = rateSettings.map(rate => {
                const rateData = rate.toJSON();
                const now = new Date();
                const startDate = new Date(rate.startDate);
                const endDate = rate.endDate ? new Date(rate.endDate) : null;
                
                // بررسی وضعیت زمانی نرخ
                let timeStatus = 'future';
                if (startDate <= now && (!endDate || endDate >= now)) {
                    timeStatus = 'current';
                } else if (endDate && endDate < now) {
                    timeStatus = 'expired';
                }
                
                return {
                    ...rateData,
                    timeStatus,
                    isCurrentlyActive: rate.isActive && timeStatus === 'current'
                };
            });
            
            return this.response(res, 200, true, 'لیست نرخ‌ها با موفقیت دریافت شد', ratesWithInfo);
        } catch (error) {
            console.error('Error in getAll:', error);
            return this.response(res, 500, false, 'خطا در دریافت لیست نرخ‌ها', null, error.message);
        }
    }

    async getInactive(req, res) {
        try {
            const inactiveRates = await RateSetting.findAll({
                where: { isActive: false },
                order: [['startDate', 'DESC']]
            });
            return this.response(res, 200, true, 'لیست نرخ‌های غیرفعال با موفقیت دریافت شد', inactiveRates);
        } catch (error) {
            console.error('Error in getInactive:', error);
            return this.response(res, 500, false, 'خطا در دریافت لیست نرخ‌های غیرفعال', null, error.message);
        }
    }

    async getActive(req, res) {
        try {
            const activeRate = await RateSetting.findOne({
                where: { isActive: true }
            });
            return this.response(res, 200, true, 'نرخ فعال با موفقیت دریافت شد', activeRate);
        } catch (error) {
            console.error('Error in getActive:', error);
            return this.response(res, 500, false, 'خطا در دریافت نرخ فعال', null, error.message);
        }
    }

    // دریافت نرخ بر اساس تاریخ ماموریت
    async getRateByDate(req, res) {
        try {
            const { missionDate } = req.query; // تاریخ ماموریت به صورت YYYY-MM-DD
            
            if (!missionDate) {
                return this.response(res, 400, false, 'تاریخ ماموریت الزامی است');
            }

            // پیدا کردن نرخ معتبر برای تاریخ ماموریت (فقط نرخ‌های فعال)
            const rate = await RateSetting.findOne({
                where: {
                    startDate: { [Op.lte]: missionDate },
                    [Op.or]: [
                        { endDate: { [Op.gte]: missionDate } },
                        { endDate: null }
                    ],
                    isActive: true
                },
                order: [['startDate', 'DESC']] // جدیدترین نرخ در صورت تداخل
            });

            if (rate) {
                return this.response(res, 200, true, `نرخ معتبر برای تاریخ ماموریت یافت شد: ${rate.title}`, {
                    ...rate.toJSON(),
                    selectedForDate: missionDate
                });
            }
            
            return this.response(res, 404, false, 'هیچ نرخ فعالی برای تاریخ ماموریت یافت نشد');
        } catch (error) {
            console.error('Error in getRateByDate:', error);
            return this.response(res, 500, false, 'خطا در دریافت نرخ بر اساس تاریخ', null, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const rate = await RateSetting.findByPk(id);
            
            if (!rate) {
                return this.response(res, 404, false, 'نرخ مورد نظر یافت نشد');
            }
            
            return this.response(res, 200, true, 'نرخ با موفقیت دریافت شد', rate);
        } catch (error) {
            console.error('Error in getById:', error);
            return this.response(res, 500, false, 'خطا در دریافت نرخ', null, error.message);
        }
    }

    async create(req, res) {
        try {
            const { title, ratePerKm, startDate, endDate, description, isActive = false } = req.body;
            
            // بررسی تداخل تاریخ‌ها با تمام نرخ‌ها (فعال و غیرفعال)
            const overlappingRate = await this.checkDateOverlap(startDate, endDate);

            if (overlappingRate) {
                return this.response(res, 400, false, `نرخ "${overlappingRate.title}" با این بازه زمانی تداخل دارد`);
            }

            // اگر می‌خواهیم نرخ را فعال کنیم، بررسی کنیم که با نرخ‌های فعال تداخل نداشته باشد
            if (isActive) {
                const activeOverlap = await this.checkActiveDateOverlap(startDate, endDate);
                if (activeOverlap) {
                    return this.response(res, 400, false, `نرخ "${activeOverlap.title}" فعال با این بازه زمانی تداخل دارد`);
                }
            }

            const newRate = await RateSetting.create({
                title,
                ratePerKm,
                startDate,
                endDate,
                description,
                isActive, // استفاده از مقدار ارسالی کاربر
                createdBy: req.user?.id
            });

            return this.response(res, 201, true, 'نرخ جدید با موفقیت ایجاد شد', newRate);
        } catch (error) {
            console.error('Error in create:', error);
            return this.response(res, 500, false, 'خطا در ایجاد نرخ جدید', null, error.message);
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, ratePerKm, startDate, endDate, description, isActive } = req.body;

            const rate = await RateSetting.findByPk(id);
            if (!rate) {
                return this.response(res, 404, false, 'نرخ مورد نظر یافت نشد');
            }

            // بررسی تداخل تاریخ‌ها با تمام نرخ‌ها (به جز خود نرخ)
            const overlappingRate = await this.checkDateOverlap(startDate, endDate, id);

            if (overlappingRate) {
                return this.response(res, 400, false, `نرخ "${overlappingRate.title}" با این بازه زمانی تداخل دارد`);
            }

            // اگر می‌خواهیم نرخ را فعال کنیم، بررسی کنیم که با نرخ‌های فعال تداخل نداشته باشد
            if (isActive) {
                const activeOverlap = await this.checkActiveDateOverlap(startDate, endDate, id);
                if (activeOverlap) {
                    return this.response(res, 400, false, `نرخ "${activeOverlap.title}" فعال با این بازه زمانی تداخل دارد`);
                }
            }

            await rate.update({
                title,
                ratePerKm,
                startDate,
                endDate,
                description,
                isActive,
                updatedBy: req.user?.id
            });

            return this.response(res, 200, true, 'نرخ با موفقیت به‌روزرسانی شد', rate);
        } catch (error) {
            console.error('Error in update:', error);
            return this.response(res, 500, false, 'خطا در به‌روزرسانی نرخ', null, error.message);
        }
    }

    // فعال/غیرفعال کردن نرخ
    async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const rate = await RateSetting.findByPk(id);
            if (!rate) {
                return this.response(res, 404, false, 'نرخ مورد نظر یافت نشد');
            }

            // اگر می‌خواهیم نرخ را فعال کنیم، بررسی کنیم که تداخلی نداشته باشد
            if (isActive) {
                const overlappingRate = await this.checkActiveDateOverlap(rate.startDate, rate.endDate, id);

                if (overlappingRate) {
                    return this.response(res, 400, false, `نرخ "${overlappingRate.title}" با این بازه زمانی تداخل دارد`);
                }
            }

            await rate.update({
                isActive,
                updatedBy: req.user?.id
            });

            const message = isActive ? 'نرخ با موفقیت فعال شد' : 'نرخ با موفقیت غیرفعال شد';
            return this.response(res, 200, true, message, rate);
        } catch (error) {
            console.error('Error in toggleActive:', error);
            return this.response(res, 500, false, 'خطا در تغییر وضعیت نرخ', null, error.message);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const rate = await RateSetting.findByPk(id);
            if (!rate) {
                return this.response(res, 404, false, 'نرخ مورد نظر یافت نشد');
            }

            // اگر نرخ فعال است، نمی‌توانیم آن را حذف کنیم
            if (rate.isActive) {
                return this.response(res, 400, false, 'نمی‌توان نرخ فعال را حذف کرد. ابتدا آن را غیرفعال کنید');
            }

            await rate.destroy();
            return this.response(res, 200, true, 'نرخ با موفقیت حذف شد');
        } catch (error) {
            console.error('Error in delete:', error);
            return this.response(res, 500, false, 'خطا در حذف نرخ', null, error.message);
        }
    }

    // بررسی وضعیت نرخ‌ها
    async getRateStatus(req, res) {
        try {
            const now = new Date();
            
            // نرخ فعال فعلی
            const activeRate = await RateSetting.findOne({
                where: { isActive: true }
            });
            
            // نرخ‌های آینده
            const futureRates = await RateSetting.findAll({
                where: {
                    startDate: { [Op.gt]: now }
                },
                order: [['startDate', 'ASC']]
            });
            
            // نرخ‌های منقضی شده
            const expiredRates = await RateSetting.findAll({
                where: {
                    endDate: { [Op.lt]: now }
                },
                order: [['endDate', 'DESC']]
            });
            
            // آمار کلی
            const totalRates = await RateSetting.count();
            const activeRates = await RateSetting.count({ where: { isActive: true } });
            const inactiveRates = await RateSetting.count({ where: { isActive: false } });
            
            const status = {
                currentActive: activeRate,
                futureRates: futureRates.length,
                expiredRates: expiredRates.length,
                statistics: {
                    total: totalRates,
                    active: activeRates,
                    inactive: inactiveRates
                },
                nextRate: futureRates[0] || null,
                lastExpired: expiredRates[0] || null
            };
            
            return this.response(res, 200, true, 'وضعیت نرخ‌ها با موفقیت دریافت شد', status);
        } catch (error) {
            console.error('Error in getRateStatus:', error);
            return this.response(res, 500, false, 'خطا در دریافت وضعیت نرخ‌ها', null, error.message);
        }
    }
}

module.exports = new RateSettingController(); 