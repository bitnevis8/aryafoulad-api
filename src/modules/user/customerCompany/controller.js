const baseController = require('../../../core/baseController');
const CustomerCompany = require('./model');
const User = require('../user/model');
const { Op } = require('sequelize');

class CustomerCompanyController extends baseController {
  constructor() {
    super();
  }

  // دریافت لیست شرکت‌های یک مشتری
  async getByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      
      const companies = await CustomerCompany.findAll({
        where: { 
          customerId: customerId,
          isActive: true 
        },
        order: [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, 'لیست شرکت‌ها دریافت شد', companies);
    } catch (error) {
      console.error('Error in getByCustomerId:', error);
      return this.response(res, 500, false, 'خطا در دریافت لیست شرکت‌ها', null, error.message);
    }
  }

  // دریافت همه شرکت‌ها
  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        isActive: true
      };

      if (search) {
        whereClause[Op.or] = [
          { companyName: { [Op.like]: `%${search}%` } },
          { registrationNumber: { [Op.like]: `%${search}%` } },
          { nationalId: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: companies } = await CustomerCompany.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'mobile', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return this.response(res, 200, true, 'لیست شرکت‌ها دریافت شد', {
        companies,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      return this.response(res, 500, false, 'خطا در دریافت لیست شرکت‌ها', null, error.message);
    }
  }

  // دریافت یک شرکت
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const company = await CustomerCompany.findOne({
        where: { id, isActive: true },
        include: [{
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'mobile', 'email']
        }]
      });

      if (!company) {
        return this.response(res, 404, false, 'شرکت یافت نشد');
      }

      return this.response(res, 200, true, 'شرکت دریافت شد', company);
    } catch (error) {
      console.error('Error in getById:', error);
      return this.response(res, 500, false, 'خطا در دریافت شرکت', null, error.message);
    }
  }

  // ایجاد شرکت یا شعبه جدید
  async create(req, res) {
    try {
      const {
        customerId,
        companyName,
        entityType,
        companyType,
        registrationNumber,
        nationalId,
        economicCode,
        phone,
        fax,
        email,
        address,
        province,
        city,
        postalCode,
        latitude,
        longitude,
        description
      } = req.body;

      // بررسی وجود مشتری
      const customer = await User.findByPk(customerId);
      if (!customer) {
        return this.response(res, 404, false, 'مشتری یافت نشد');
      }

      // بررسی تکراری بودن شناسه ملی
      if (nationalId) {
        const existingCompany = await CustomerCompany.findOne({
          where: { nationalId, isActive: true }
        });
        if (existingCompany) {
          return this.response(res, 400, false, 'شرکت با این شناسه ملی قبلاً ثبت شده است');
        }
      }

      const newEntity = await CustomerCompany.create({
        customerId,
        companyName,
        entityType: entityType || 'company',
        companyType,
        registrationNumber,
        nationalId,
        economicCode,
        phone,
        fax,
        email,
        address,
        province,
        city,
        postalCode,
        latitude,
        longitude,
        description
      });

      const entityTypeText = entityType === 'branch' ? 'شعبه' : 'شرکت';
      return this.response(res, 201, true, `${entityTypeText} جدید با موفقیت ایجاد شد`, newEntity);
    } catch (error) {
      console.error('Error in create:', error);
      return this.response(res, 500, false, 'خطا در ایجاد شرکت جدید', null, error.message);
    }
  }

  // به‌روزرسانی شرکت
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const company = await CustomerCompany.findByPk(id);
      if (!company) {
        return this.response(res, 404, false, 'شرکت یافت نشد');
      }

      // بررسی تکراری بودن شناسه ملی (اگر تغییر کرده باشد)
      if (updateData.nationalId && updateData.nationalId !== company.nationalId) {
        const existingCompany = await CustomerCompany.findOne({
          where: { 
            nationalId: updateData.nationalId, 
            isActive: true,
            id: { [Op.ne]: id }
          }
        });
        if (existingCompany) {
          return this.response(res, 400, false, 'شرکت با این شناسه ملی قبلاً ثبت شده است');
        }
      }

      await company.update(updateData);
      return this.response(res, 200, true, 'شرکت با موفقیت به‌روزرسانی شد', company);
    } catch (error) {
      console.error('Error in update:', error);
      return this.response(res, 500, false, 'خطا در به‌روزرسانی شرکت', null, error.message);
    }
  }

  // حذف شرکت (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const company = await CustomerCompany.findByPk(id);
      if (!company) {
        return this.response(res, 404, false, 'شرکت یافت نشد');
      }

      await company.destroy();
      return this.response(res, 200, true, 'شرکت با موفقیت حذف شد');
    } catch (error) {
      console.error('Error in delete:', error);
      return this.response(res, 500, false, 'خطا در حذف شرکت', null, error.message);
    }
  }
}

module.exports = new CustomerCompanyController();
