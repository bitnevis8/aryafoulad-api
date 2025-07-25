const BaseController = require('../../../core/baseController');
const { MissionOrder } = require('./model');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const config = require('config');
const { MissionCompanion } = require('./model');

class MissionOrderController extends BaseController {
    constructor() {
        super(MissionOrder);
        this.model = MissionOrder;
    }

    // تابع کمکی برای تولید QR Code
    async generateQRCode(missionOrderId) {
        const baseUrl = config.get('FRONTEND_URL') || 'http://localhost:3000';
        const url = `${baseUrl}/mission-order/${missionOrderId}`;
        try {
            const qrCode = await QRCode.toDataURL(url);
            return qrCode;
        } catch (err) {
            console.error('Error generating QR code:', err);
            return null;
        }
    }

    async getAll(req, res) {
        try {
            const docs = await this.model.findAll();
            
            // Parse destinations for each document
            docs.forEach(doc => {
                if (doc.destinations) {
                    try {
                        doc.destinations = JSON.parse(doc.destinations);
                    } catch (e) {
                        console.error('Error parsing destinations:', e);
                        doc.destinations = [];
                    }
                }
            });
            
            return this.response(res, 200, true, 'تمام حکم‌های ماموریت دریافت شدند.', docs);
        } catch (err) {
            return this.response(res, 500, false, 'خطا در دریافت حکم‌های ماموریت.', null, err);
        }
    }

    async getById(req, res) {
        try {
            const doc = await this.model.findByPk(req.params.id);
            if (!doc) return this.response(res, 404, false, 'حکم ماموریت یافت نشد.');
            
            // Parse destinations from JSON string
            if (doc.destinations) {
                try {
                    doc.destinations = JSON.parse(doc.destinations);
                } catch (e) {
                    console.error('Error parsing destinations:', e);
                    doc.destinations = [];
                }
            }
            
            // Fetch companions from MissionCompanion model
            const companions = await MissionCompanion.findAll({
                where: { missionOrderId: doc.id },
                attributes: ['userId']
            });
            const companionIds = companions.map(companion => companion.userId);
            
            // Include userId and companions in the response
            const responseData = {
                ...doc.toJSON(),
                userId: doc.userId,
                companions: companionIds
            };
            
            return this.response(res, 200, true, 'حکم ماموریت یافت شد.', responseData);
        } catch (err) {
            return this.response(res, 500, false, 'خطا در دریافت حکم ماموریت.', null, err);
        }
    }

    async create(req, res) {
        try {
            console.log("=== Request Body ===");
            console.log(JSON.stringify(req.body, null, 2));
            
            // تبدیل آرایه مقصدها به رشته
            const destinations = Array.isArray(req.body.destinations) ? req.body.destinations : [];
            
            // محاسبه مسافت و زمان برای یک یا چند مقصد
            let totalDistance = 0;
            let roundTripDistance = 0;
            let estimatedTime = req.body.estimatedTime || '0';
            let estimatedReturnTime = req.body.estimatedReturnTime || '0';
            
            if (destinations.length > 0) {
                // اگر فقط یک مقصد داریم
                if (destinations.length === 1) {
                    totalDistance = parseFloat(destinations[0].distance) || 0;
                    roundTripDistance = totalDistance * 2; // رفت و برگشت
                } else {
                    // محاسبه مسافت برای چند مقصد
                    for (let i = 0; i < destinations.length; i++) {
                        if (destinations[i].distance) {
                            totalDistance += parseFloat(destinations[i].distance);
                        }
                    }
                    roundTripDistance = totalDistance * 2;
                }
            }

            // استفاده از هزینه نهایی که از فرانت‌اند ارسال شده است
            const ratePerKm = parseFloat(req.body.ratePerKm) || 2500;
            const finalCost = parseFloat(req.body.finalCost) || 0;

            console.log("=== Calculated Values ===");
            console.log("totalDistance:", totalDistance);
            console.log("roundTripDistance:", roundTripDistance);
            console.log("estimatedTime:", estimatedTime);
            console.log("estimatedReturnTime:", estimatedReturnTime);
            console.log("ratePerKm:", ratePerKm);
            console.log("finalCost:", finalCost);
            console.log("userId:", req.body.userId);
            console.log("companionIds:", req.body.companionIds);

            // Convert string values to numbers and handle destinations
            const data = {
                personnelNumber: req.body.personnelNumber || null,
                fromUnit: req.body.fromUnit || null,
                day: req.body.day || null,
                time: req.body.time || null,
                destinations: JSON.stringify(destinations),
                missionCoordinates: req.body.missionCoordinates || null,
                missionSubject: req.body.missionSubject || null,
                missionDescription: req.body.missionDescription || null,
                companions: req.body.companions || null,
                transport: req.body.transport || null,
                totalWeightKg: req.body.totalWeightKg ? parseFloat(req.body.totalWeightKg) : null,
                distance: totalDistance,
                roundTripDistance: roundTripDistance,
                estimatedTime: estimatedTime,
                estimatedReturnTime: estimatedReturnTime,
                sessionCode: req.body.sessionCode || null,
                ratePerKm: ratePerKm,
                finalCost: finalCost,
                userId: req.body.userId || null
            };
            
            console.log("=== Processed Data ===");
            console.log(JSON.stringify(data, null, 2));
            
            const doc = await MissionOrder.create(data);
            console.log("=== Created Mission Order ===");
            console.log(JSON.stringify(doc.toJSON(), null, 2));
            
            // اضافه کردن همراهان
            if (req.body.companionIds && Array.isArray(req.body.companionIds)) {
                console.log("=== Creating Companion Records ===");
                const companionRecords = req.body.companionIds.map(userId => ({
                    missionOrderId: doc.id,
                    userId: userId
                }));
                console.log("Companion records to create:", JSON.stringify(companionRecords, null, 2));
                const createdCompanions = await MissionCompanion.bulkCreate(companionRecords);
                console.log("Created companions:", JSON.stringify(createdCompanions.map(c => c.toJSON()), null, 2));
            }
            
            // تولید QR Code
            const qrCode = await this.generateQRCode(doc.id);
            if (qrCode) {
                await doc.update({ qrCode });
            }
            
            // تبدیل destinations به آرایه قبل از ارسال پاسخ
            if (doc.destinations) {
                try {
                    doc.destinations = JSON.parse(doc.destinations);
                } catch (e) {
                    console.error('Error parsing destinations:', e);
                    doc.destinations = [];
                }
            }
            
            return this.response(res, 201, true, 'حکم ماموریت با موفقیت ایجاد شد.', doc);
        } catch (err) {
            console.error("Error details:", err);
            console.error("Error message:", err.message);
            console.error("Error stack:", err.stack);
            return this.response(res, 500, false, 'خطا در ایجاد حکم ماموریت: ' + err.message, null, err);
        }
    }

    async update(req, res) {
        try {
            const doc = await this.model.findByPk(req.params.id);
            if (!doc) return this.response(res, 404, false, 'حکم ماموریت یافت نشد.');
            
            // تبدیل آرایه مقصدها به رشته
            let destinations = [];
            try {
                destinations = Array.isArray(req.body.destinations) 
                    ? req.body.destinations 
                    : (typeof req.body.destinations === 'string' 
                        ? JSON.parse(req.body.destinations) 
                        : []);
            } catch (e) {
                console.error('Error parsing destinations:', e);
                destinations = [];
            }
            
            // محاسبه مسافت و زمان برای یک یا چند مقصد
            let totalDistance = 0;
            let roundTripDistance = 0;
            let estimatedTime = req.body.estimatedTime || '0';
            let estimatedReturnTime = req.body.estimatedReturnTime || '0';
            
            if (destinations.length > 0) {
                // اگر فقط یک مقصد داریم
                if (destinations.length === 1) {
                    totalDistance = parseFloat(destinations[0].distance) || 0;
                    roundTripDistance = totalDistance * 2; // رفت و برگشت
                } else {
                    // محاسبه مسافت برای چند مقصد
                    for (let i = 0; i < destinations.length; i++) {
                        if (destinations[i].distance) {
                            totalDistance += parseFloat(destinations[i].distance);
                        }
                    }
                    roundTripDistance = totalDistance * 2;
                }
            }

            // استفاده از هزینه نهایی که از فرانت‌اند ارسال شده است
            const ratePerKm = parseFloat(req.body.ratePerKm) || 2500;
            const finalCost = parseFloat(req.body.finalCost) || 0;
            
            // تبدیل companions به رشته
            let companionsString = '';
            if (Array.isArray(req.body.companions)) {
                companionsString = req.body.companions.join(',');
            } else if (typeof req.body.companions === 'string') {
                companionsString = req.body.companions;
            }
            
            // Update fields including userId and companions
            const updatedData = {
                firstName: req.body.firstName || null,
                lastName: req.body.lastName || null,
                personnelNumber: req.body.personnelNumber || null,
                fromUnit: req.body.fromUnit || null,
                day: req.body.day || null,
                time: req.body.time || null,
                destinations: JSON.stringify(destinations),
                missionCoordinates: req.body.missionCoordinates || null,
                missionSubject: req.body.missionSubject || null,
                missionDescription: req.body.missionDescription || null,
                companions: companionsString,
                transport: req.body.transport || null,
                totalWeightKg: req.body.totalWeightKg ? parseFloat(req.body.totalWeightKg) : null,
                distance: totalDistance,
                roundTripDistance: roundTripDistance,
                estimatedTime: estimatedTime,
                estimatedReturnTime: estimatedReturnTime,
                sessionCode: req.body.sessionCode || null,
                ratePerKm: ratePerKm,
                finalCost: finalCost,
                userId: req.body.userId || null
            };
            
            await doc.update(updatedData);

            // به‌روزرسانی همراهان
            if (req.body.companionIds && Array.isArray(req.body.companionIds)) {
                // حذف همراهان قبلی
                await MissionCompanion.destroy({
                    where: { missionOrderId: doc.id }
                });

                // ایجاد همراهان جدید
                const companionRecords = req.body.companionIds.map(userId => ({
                    missionOrderId: doc.id,
                    userId: userId
                }));
                await MissionCompanion.bulkCreate(companionRecords);
            }
            
            // Parse destinations for response
            if (doc.destinations) {
                try {
                    doc.destinations = JSON.parse(doc.destinations);
                } catch (e) {
                    console.error('Error parsing destinations:', e);
                    doc.destinations = [];
                }
            }
            
            return this.response(res, 200, true, 'حکم ماموریت با موفقیت به‌روزرسانی شد.', doc);
        } catch (err) {
            console.error('Error updating mission order:', err);
            return this.response(res, 500, false, 'خطا در به‌روزرسانی حکم ماموریت.', null, err);
        }
    }

    async delete(req, res) {
        try {
            const doc = await this.model.findByPk(req.params.id);
            if (!doc) return this.response(res, 404, false, 'حکم ماموریت یافت نشد.');
            await doc.destroy();
            return this.response(res, 200, true, 'حکم ماموریت با موفقیت حذف شد.');
        } catch (err) {
            return this.response(res, 500, false, 'خطا در حذف حکم ماموریت.', null, err);
        }
    }

    async search(req, res) {
        try {
            const query = req.query.q;
            const docs = await this.model.findAll({
                where: {
                    missionSubject: {
                        [Op.like]: `%${query}%`
                    }
                }
            });
            return this.response(res, 200, true, 'نتایج جستجو دریافت شد.', docs);
        } catch (err) {
            return this.response(res, 500, false, 'خطا در جستجو.', null, err);
        }
    }
}

module.exports = new MissionOrderController(); 