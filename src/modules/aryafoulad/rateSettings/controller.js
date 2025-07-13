const baseController = require('../../../core/baseController');
const RateSetting = require('./model');
const { Op } = require('sequelize');

class RateSettingController extends baseController {
    constructor() {
        super();
    }

    async getAll(req, res) {
        try {
            const rateSettings = await RateSetting.findAll({
                order: [['startDate', 'DESC']]
            });
            return this.response(res, 200, true, 'لیست نرخ‌ها با موفقیت دریافت شد', rateSettings);
        } catch (error) {
            console.error('Error in getAll:', error);
            return this.response(res, 500, false, 'خطا در دریافت لیست نرخ‌ها', null, error.message);
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

            // ابتدا بررسی می‌کنیم که آیا فیلدهای جدید وجود دارند یا نه
            try {
                // پیدا کردن نرخ معتبر برای تاریخ ماموریت
                const rate = await RateSetting.findOne({
                    where: {
                        startDate: { [Op.lte]: missionDate },
                        [Op.or]: [
                            { endDate: { [Op.gte]: missionDate } },
                            { endDate: null }
                        ],
                        isActive: true // فقط نرخ‌های فعال
                    },
                    order: [['startDate', 'DESC']] // جدیدترین نرخ در صورت تداخل
                });

                if (rate) {
                    // بررسی اینکه آیا این نرخ پیش‌فرض است یا نه
                    const isDefaultRate = rate.title === 'نرخ پیش‌فرض';
                    const message = isDefaultRate 
                        ? 'نرخ پیش‌فرض برای تاریخ ماموریت اعمال شد' 
                        : `نرخ معتبر برای تاریخ ماموریت یافت شد: ${rate.title}`;
                    
                    return this.response(res, 200, true, message, {
                        ...rate.toJSON(),
                        isDefaultRate,
                        selectedForDate: missionDate
                    });
                }

                // اگر نرخ بر اساس تاریخ پیدا نشد، نرخ پیش‌فرض را برگردان
                const defaultRate = await RateSetting.findOne({
                    where: { title: 'نرخ پیش‌فرض' }
                });
                
                if (defaultRate) {
                    return this.response(res, 200, true, 'نرخ پیش‌فرض برای تاریخ ماموریت اعمال شد', {
                        ...defaultRate.toJSON(),
                        isDefaultRate: true,
                        selectedForDate: missionDate
                    });
                }
                
                return this.response(res, 404, false, 'هیچ نرخ معتبری برای تاریخ ماموریت یافت نشد');
            } catch (dbError) {
                // اگر فیلدهای جدید وجود ندارند، نرخ فعال را برگردان
                console.log('Database fields not ready, falling back to active rate');
                const activeRate = await RateSetting.findOne({
                    where: { isActive: true }
                });
                
                if (activeRate) {
                    return this.response(res, 200, true, 'نرخ فعال یافت شد', {
                        ...activeRate.toJSON(),
                        isDefaultRate: false,
                        selectedForDate: missionDate
                    });
                }
                
                return this.response(res, 404, false, 'هیچ نرخ فعالی یافت نشد');
            }
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
            const { title, ratePerKm, startDate, endDate, description } = req.body;
            
            // بررسی تداخل تاریخ‌ها
            const overlappingRate = await RateSetting.findOne({
                where: {
                    startDate: { [Op.lte]: endDate || '9999-12-31' },
                    [Op.or]: [
                        { endDate: { [Op.gte]: startDate } },
                        { endDate: null }
                    ],
                    isActive: true
                }
            });

            if (overlappingRate) {
                return this.response(res, 400, false, 'نرخ‌های فعال با این بازه زمانی تداخل دارند');
            }

            const newRate = await RateSetting.create({
                title,
                ratePerKm,
                startDate,
                endDate,
                description,
                isActive: true,
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

            // بررسی تداخل تاریخ‌ها (به جز خود نرخ)
            const overlappingRate = await RateSetting.findOne({
                where: {
                    id: { [Op.ne]: id },
                    startDate: { [Op.lte]: endDate || '9999-12-31' },
                    [Op.or]: [
                        { endDate: { [Op.gte]: startDate } },
                        { endDate: null }
                    ],
                    isActive: true
                }
            });

            if (overlappingRate) {
                return this.response(res, 400, false, 'نرخ‌های فعال با این بازه زمانی تداخل دارند');
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

    async delete(req, res) {
        try {
            const { id } = req.params;

            const rate = await RateSetting.findByPk(id);
            if (!rate) {
                return this.response(res, 404, false, 'نرخ مورد نظر یافت نشد');
            }

            // اگر نرخ فعال است، نمی‌توانیم آن را حذف کنیم
            if (rate.isActive) {
                return this.response(res, 400, false, 'نمی‌توان نرخ فعال را حذف کرد');
            }

            await rate.destroy();
            return this.response(res, 200, true, 'نرخ با موفقیت حذف شد');
        } catch (error) {
            console.error('Error in delete:', error);
            return this.response(res, 500, false, 'خطا در حذف نرخ', null, error.message);
        }
    }
}

module.exports = new RateSettingController(); 