const BaseController = require('../../../../core/baseController');
const Warehouse = require('./model');
const { Op } = require('sequelize');

class WarehouseController extends BaseController {
    constructor() {
        super(Warehouse);
    }

    // متدهای اضافی خاص warehouse می‌توانند اینجا اضافه شوند

    // ✅ دریافت تمام انبارها
    async getAll(req, res) {
        try {
            console.log("Starting getAll method...");
            const warehouses = await Warehouse.findAll();
            console.log("✅ Warehouses found successfully");
            return this.response(res, 200, true, "لیست انبارها دریافت شد.", warehouses);
        } catch (error) {
            console.error("❌ Error in getAll:", error);
            return this.response(
                res,
                500,
                false,
                error.message || "خطا در دریافت داده‌ها",
                null,
                error
            );
        }
    }

    // ✅ دریافت یک انبار بر اساس ID
    async getOne(req, res) {
        try {
            const warehouse = await Warehouse.findByPk(req.params.id);
            
            if (!warehouse) {
                console.warn("⚠️ Warehouse not found:", req.params.id);
                return this.response(res, 404, false, "انبار یافت نشد.");
            }

            console.log("✅ Warehouse retrieved successfully:", req.params.id);
            return this.response(res, 200, true, "انبار دریافت شد.", warehouse);
        } catch (error) {
            console.error("❌ Error in getOne:", error);
            return this.response(res, 500, false, "خطا در دریافت داده", null, error);
        }
    }

    // ✅ ایجاد یک انبار جدید
    async create(req, res) {
        try {
            const { name, description, location } = req.body;

            // چک کردن تکراری بودن نام انبار
            const existingWarehouse = await Warehouse.findOne({
                where: { name }
            });

            if (existingWarehouse) {
                console.warn("⚠️ Duplicate warehouse attempt:", name);
                return this.response(
                    res,
                    400,
                    false,
                    "نام انبار قبلاً ثبت شده است."
                );
            }

            // ایجاد انبار جدید
            const newWarehouse = await Warehouse.create({
                name,
                description: description || null,
                location: location || null
            });

            console.log("✅ Warehouse created successfully:", newWarehouse.id);
            return this.response(res, 201, true, "انبار جدید ایجاد شد.", newWarehouse);
        } catch (error) {
            console.error("❌ Error in create:", error);
            return this.response(res, 500, false, "خطا در ایجاد انبار", null, error);
        }
    }

    // ✅ ویرایش یک انبار
    async update(req, res) {
        try {
            const warehouse = await Warehouse.findByPk(req.params.id);
            if (!warehouse) {
                console.warn("⚠️ Warehouse not found for update:", req.params.id);
                return this.response(res, 404, false, "انبار یافت نشد.");
            }

            const { name, description, location } = req.body;

            // چک کردن تکراری بودن نام انبار (اگر تغییر کرده باشد)
            if (name && name !== warehouse.name) {
                const existingWarehouse = await Warehouse.findOne({
                    where: { name }
                });

                if (existingWarehouse) {
                    console.warn("⚠️ Duplicate warehouse name:", name);
                    return this.response(
                        res,
                        400,
                        false,
                        "نام انبار قبلاً ثبت شده است."
                    );
                }
            }

            // بروزرسانی اطلاعات انبار
            const updates = {
                name: name ?? warehouse.name,
                description: description ?? warehouse.description,
                location: location ?? warehouse.location
            };

            await warehouse.update(updates);

            console.log("✅ Warehouse updated successfully:", warehouse.id);
            return this.response(res, 200, true, "انبار بروزرسانی شد.", warehouse);
        } catch (error) {
            console.error("❌ Error in update:", error);
            return this.response(
                res,
                500,
                false,
                "خطا در بروزرسانی انبار",
                null,
                error
            );
        }
    }

    // ✅ حذف یک انبار
    async delete(req, res) {
        try {
            const warehouse = await Warehouse.findByPk(req.params.id);
            if (!warehouse) {
                console.warn("⚠️ Warehouse not found for deletion:", req.params.id);
                return this.response(res, 404, false, "انبار یافت نشد.");
            }

            await warehouse.destroy();
            console.log("✅ Warehouse deleted successfully:", req.params.id);
            return this.response(res, 200, true, "انبار حذف شد.");
        } catch (error) {
            console.error("❌ Error in delete:", error);
            return this.response(res, 500, false, "خطا در حذف انبار", null, error);
        }
    }

    // ✅ جستجوی انبارها
    async search(req, res) {
        try {
            const { query } = req.query;
            const warehouses = await Warehouse.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { description: { [Op.like]: `%${query}%` } },
                        { location: { [Op.like]: `%${query}%` } }
                    ]
                }
            });

            console.log("✅ Warehouses searched successfully with query:", query);
            return this.response(res, 200, true, "جستجو با موفقیت انجام شد.", warehouses);
        } catch (error) {
            console.error("❌ Error in search:", error);
            return this.response(res, 500, false, "خطا در جستجوی انبارها", null, error);
        }
    }
}

module.exports = new WarehouseController(); 