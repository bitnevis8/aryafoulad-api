const BaseController = require("../../../core/baseController");
const User = require("./model");
const Role = require("../role/model");
const bcrypt = require("bcryptjs");
const config = require("config");
const Joi = require("joi");
const { Op } = require("sequelize");

class UserController extends BaseController {
  constructor() {
    super(User);
  }

  // ✅ دریافت تمام کاربران
  async getAll(req, res) {
    try {
      console.log("Starting getAll method...");
      const { sortBy, sortOrder, page = 1, limit = 10 } = req.query; // Get pagination and sort parameters
      const order = [];
      const allowedSortColumns = ["firstName", "lastName", "email", "mobile", "username"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      // Calculate offset for pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const pageLimit = parseInt(limit);

      // Get total count for pagination info
      const totalCount = await User.count({
        include: [{
          model: Role,
          as: "roles"
        }]
      });

      const users = await User.findAll({
        include: [{
          model: Role,
          as: "roles"
        }],
        order: order.length > 0 ? order : [['createdAt', 'DESC']], // Default sort by createdAt DESC
        limit: pageLimit,
        offset: offset
      });

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / pageLimit);
      const currentPage = parseInt(page);
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      const paginationInfo = {
        currentPage,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: pageLimit
      };

      console.log("✅ Users found successfully");
      return this.response(res, 200, true, "لیست کاربران دریافت شد.", {
        users,
        pagination: paginationInfo
      });
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

  // ✅ دریافت یک کاربر بر اساس ID
  async getOne(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{
          model: Role,
          as: "roles"
        }]
      });
      
      if (!user) {
        console.warn("⚠️ User not found:", req.params.id);
        return this.response(res, 404, false, "کاربر یافت نشد.");
      }

      console.log("✅ User retrieved successfully:", req.params.id);
      return this.response(res, 200, true, "کاربر دریافت شد.", user);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ ایجاد یک کاربر جدید
  async create(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        mobile,
        phone,
        fax,
        username,
        password,
        roleIds,
        avatar,
        signature,
        nationalId,
        type,
        companyName,
        businessName,
        businessContactInfo,
        latitude,
        longitude,
        address,
        province,
        city,
        postalCode,
      } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        type: Joi.string().valid('person', 'company').default('person'),
        // فیلدهای مشترک
        email: Joi.string().allow(null, '').optional(), // ایمیل اختیاری است
        mobile: Joi.string().required(), // موبایل همیشه اجباری
        phone: Joi.string().allow(null, '').optional(),
        fax: Joi.string().allow(null, '').optional(),
        username: Joi.string().allow(null, '').optional(),
        password: Joi.string().min(6).required(),
        roleIds: Joi.array().items(Joi.number().integer()).optional(),
        avatar: Joi.string().allow(null, '').optional(),
        signature: Joi.string().allow(null, '').optional(),
        latitude: Joi.number().optional().allow(null),
        longitude: Joi.number().optional().allow(null),
        address: Joi.string().allow(null, '').optional(),
        province: Joi.string().allow(null, '').optional(),
        city: Joi.string().allow(null, '').optional(),
        postalCode: Joi.string().pattern(/^\d{10}$/).allow(null, '').optional(),
        // فیلدهای شرطی بر اساس نوع کاربر
        firstName: Joi.when('type', {
          is: 'person',
          then: Joi.string().required(), // برای حقیقی: نام اجباری
          otherwise: Joi.string().allow(null, '').optional()
        }),
        lastName: Joi.when('type', {
          is: 'person',
          then: Joi.string().required(), // برای حقیقی: نام خانوادگی اجباری
          otherwise: Joi.string().allow(null, '').optional()
        }),
        companyName: Joi.when('type', {
          is: 'company',
          then: Joi.string().required(), // برای حقوقی: نام شرکت اجباری
          otherwise: Joi.string().allow(null, '').optional()
        }),
        nationalId: Joi.string().allow(null, '').optional(),
        economicCode: Joi.string().allow(null, '').optional(),
        registrationNumber: Joi.string().allow(null, '').optional(),
        businessName: Joi.string().allow(null, '').optional(),
        businessContactInfo: Joi.string().allow(null, '').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        console.warn("⚠️ Validation error:", error.details[0].message);
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن ایمیل یا موبایل
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            value.email && value.email.trim() !== '' ? { email: value.email } : null,
            value.mobile && value.mobile.trim() !== '' ? { mobile: value.mobile } : null,
            value.nationalId && value.nationalId.trim() !== '' ? { nationalId: value.nationalId } : null,
          ].filter(Boolean),
        },
      });

      if (existingUser) {
        console.warn("⚠️ Duplicate user attempt:", value.email);
        return this.response(
          res,
          400,
          false,
          "ایمیل یا موبایل قبلاً ثبت شده است."
        );
      }

      // ایجاد کاربر جدید
      const newUser = await User.create({
        firstName: value.firstName || null,
        lastName: value.lastName || null,
        email: value.email || null,
        mobile: value.mobile || null,
        phone: value.phone || null,
        fax: value.fax || null,
        username: value.username || null,
        password: value.password,
        avatar: value.avatar || null,
        signature: value.signature || null,
        isEmailVerified: true,
        nationalId: value.nationalId || null,
        type: value.type || 'person',
        companyName: value.companyName || null,
        economicCode: value.economicCode || null,
        registrationNumber: value.registrationNumber || null,
        businessName: value.businessName || null,
        businessContactInfo: value.businessContactInfo || null,
        latitude: typeof value.latitude === 'number' ? value.latitude : null,
        longitude: typeof value.longitude === 'number' ? value.longitude : null,
        address: value.address || null,
        province: value.province || null,
        city: value.city || null,
        postalCode: value.postalCode || null,
      });

      // اگر roleIds ارائه شده باشد، نقش‌ها را به کاربر اضافه کنید
      if (value.roleIds && value.roleIds.length > 0) {
        const roles = await Role.findAll({
          where: {
            id: value.roleIds
          }
        });
        await newUser.setRoles(roles);
      }

      console.log("✅ User created successfully:", newUser.id);
      return this.response(res, 201, true, "کاربر جدید ایجاد شد.", newUser);
    } catch (error) {
      console.error("❌ Error in create:", error);
      return this.response(res, 500, false, "خطا در ایجاد کاربر", null, error);
    }
  }

  // ✅ ویرایش یک کاربر
  async update(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        console.warn("⚠️ User not found for update:", req.params.id);
        return this.response(res, 404, false, "کاربر یافت نشد.");
      }

      const {
        firstName,
        lastName,
        email,
        mobile,
        phone,
        fax,
        username,
        password,
        roleIds,
        avatar,
        signature,
        nationalId,
        type,
        companyName,
        businessName,
        businessContactInfo,
        latitude,
        longitude,
        address,
        province,
        city,
        postalCode,
      } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        type: Joi.string().valid('person', 'company').optional(),
        // فیلدهای مشترک
        email: Joi.string().allow(null, '').optional(),
        mobile: Joi.string().optional(),
        phone: Joi.string().allow(null, '').optional(),
        fax: Joi.string().allow(null, '').optional(),
        username: Joi.string().allow(null, '').optional(),
        password: Joi.string().min(6).optional(),
        roleIds: Joi.array().items(Joi.number().integer()).optional(),
        avatar: Joi.string().allow(null, '').optional(),
        signature: Joi.string().allow(null, '').optional(),
        latitude: Joi.number().optional().allow(null),
        longitude: Joi.number().optional().allow(null),
        address: Joi.string().allow(null, '').optional(),
        province: Joi.string().allow(null, '').optional(),
        city: Joi.string().allow(null, '').optional(),
        postalCode: Joi.string().pattern(/^\d{10}$/).allow(null, '').optional(),
        // فیلدهای شرطی بر اساس نوع کاربر
        firstName: Joi.when('type', {
          is: 'person',
          then: Joi.string().optional(),
          otherwise: Joi.string().allow(null, '').optional()
        }),
        lastName: Joi.string().allow(null, '').optional(),
        companyName: Joi.when('type', {
          is: 'company',
          then: Joi.string().optional(),
          otherwise: Joi.string().allow(null, '').optional()
        }),
        nationalId: Joi.string().allow(null, '').optional(),
        economicCode: Joi.string().allow(null, '').optional(),
        registrationNumber: Joi.string().allow(null, '').optional(),
        businessName: Joi.string().allow(null, '').optional(),
        businessContactInfo: Joi.string().allow(null, '').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        console.warn("⚠️ Validation error:", error.details[0].message);
        return this.response(res, 400, false, error.details[0].message);
      }

      // بروزرسانی اطلاعات کاربر
      const updates = {
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        email: email ?? user.email,
        mobile: mobile ?? user.mobile,
        phone: phone ?? user.phone,
        fax: fax ?? user.fax,
        username: username ?? user.username,
        avatar: avatar ?? user.avatar,
        signature: signature ?? user.signature,
        nationalId: nationalId ?? user.nationalId,
        type: type ?? user.type,
        companyName: companyName ?? user.companyName,
        businessName: businessName ?? user.businessName,
        businessContactInfo: businessContactInfo ?? user.businessContactInfo,
        latitude: typeof latitude === 'number' ? latitude : user.latitude,
        longitude: typeof longitude === 'number' ? longitude : user.longitude,
        address: address ?? user.address,
        province: province ?? user.province,
        city: city ?? user.city,
        postalCode: postalCode ?? user.postalCode,
      };

      if (password) {
        updates.password = password;
      }

      // بروزرسانی اطلاعات کاربر
      await user.update(updates);

      // اگر roleIds ارائه شده باشد، نقش‌های کاربر را بروزرسانی کنید
      if (roleIds && roleIds.length > 0) {
        const roles = await Role.findAll({
          where: {
            id: roleIds
          }
        });
        await user.setRoles(roles);
      } else if (roleIds && roleIds.length === 0) {
        // If an empty array is provided, clear all roles
        await user.setRoles([]);
      }
      
      console.log("✅ User updated successfully:", user.id);
      return this.response(res, 200, true, "کاربر بروزرسانی شد.", user);
    } catch (error) {
      console.error("❌ Error in update:", error);
      return this.response(
        res,
        500,
        false,
        "خطا در بروزرسانی کاربر",
        null,
        error
      );
    }
  }

  // ✅ حذف یک کاربر
  async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        console.warn("⚠️ User not found for deletion:", req.params.id);
        return this.response(res, 404, false, "کاربر یافت نشد.");
      }

      await user.destroy();
      console.log("✅ User deleted successfully:", req.params.id);
      return this.response(res, 200, true, "کاربر حذف شد.");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return this.response(res, 500, false, "خطا در حذف کاربر", null, error);
    }
  }

  // ✅ جستجوی کاربران
  async search(req, res) {
    try {
      const { q, limit = 10, offset = 0, sortBy, sortOrder } = req.query; // Get sortBy and sortOrder from query

      const whereClause = {};
      if (q) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${q}%` } },
          { lastName: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { mobile: { [Op.like]: `%${q}%` } },
          { username: { [Op.like]: `%${q}%` } },
        ];
      }

      const order = [];
      const allowedSortColumns = ["firstName", "lastName", "email", "mobile", "username"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        include: [{
          model: Role,
          as: "roles"
        }],
        order: order.length > 0 ? order : [['createdAt', 'DESC']], // Default sort by createdAt DESC
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      console.log("✅ Users searched successfully:", users.count);
      return this.response(res, 200, true, "نتایج جستجو دریافت شد.", users);
    } catch (error) {
      console.error("❌ Error in search:", error);
      return this.response(
        res,
        500,
        false,
        error.message || "خطا در جستجو",
        null,
        error
      );
    }
  }
}

module.exports = new UserController();
