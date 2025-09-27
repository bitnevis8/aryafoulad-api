const BaseController = require("../../../core/baseController");
const InspectionRequest = require("./model");
const ProjectType = require("../projects/models").ProjectType;
const { Project } = require("../projects/models");
const User = require("../../user/user/model");

class InspectionRequestController extends BaseController {
  constructor() {
    super();
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, status, project_type_id, q, firstName, lastName, mobile, dateFrom, dateTo } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (status) whereClause.status = status;
      if (project_type_id) whereClause.project_type_id = project_type_id;
      
      // فیلترهای جستجو
      if (q) {
        whereClause[require('sequelize').Op.or] = [
          { firstName: { [require('sequelize').Op.like]: `%${q}%` } },
          { lastName: { [require('sequelize').Op.like]: `%${q}%` } },
          { mobile: { [require('sequelize').Op.like]: `%${q}%` } }
        ];
      }
      if (firstName) whereClause.firstName = { [require('sequelize').Op.like]: `%${firstName}%` };
      if (lastName) whereClause.lastName = { [require('sequelize').Op.like]: `%${lastName}%` };
      if (mobile) whereClause.mobile = { [require('sequelize').Op.like]: `%${mobile}%` };
      
      // فیلتر تاریخ
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo + 'T23:59:59.999Z');
      }
      
      // فقط درخواست‌هایی که تبدیل به پروژه نشده‌اند
      whereClause.project_id = null;

      const { count, rows } = await InspectionRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ProjectType,
            as: 'projectType',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'reviewer',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return this.response(res, 200, true, "درخواست‌ها با موفقیت دریافت شدند", {
        requests: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      return this.response(res, 500, false, "خطا در دریافت درخواست‌ها", null, error.message);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const request = await InspectionRequest.findByPk(id, {
        include: [
          {
            model: ProjectType,
            as: 'projectType',
            attributes: ['id', 'name', 'code', 'description']
          },
          {
            model: User,
            as: 'reviewer',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      if (!request) {
        return this.response(res, 404, false, "درخواست مورد نظر یافت نشد");
      }

      return this.response(res, 200, true, "درخواست با موفقیت دریافت شد", request);
    } catch (error) {
      console.error('Error in getById:', error);
      return this.response(res, 500, false, "خطا در دریافت درخواست", null, error.message);
    }
  }

  async create(req, res) {
    try {
      const { firstName, lastName, mobile, description, project_type_id, request_payload } = req.body;

      // اعتبارسنجی فیلدهای اجباری
      if (!firstName || !lastName || !mobile || !project_type_id) {
        return this.response(res, 400, false, "نام، نام خانوادگی، موبایل و نوع پروژه اجباری هستند");
      }

      // بررسی وجود نوع پروژه
      const projectType = await ProjectType.findByPk(project_type_id);
      if (!projectType) {
        return this.response(res, 400, false, "نوع پروژه مورد نظر یافت نشد");
      }

      const newRequest = await InspectionRequest.create({
        firstName,
        lastName,
        mobile,
        description: description || null,
        project_type_id,
        request_payload: request_payload || null,
        status: 'pending'
      });

      // بارگذاری مجدد با اطلاعات کامل
      const createdRequest = await InspectionRequest.findByPk(newRequest.id, {
        include: [
          {
            model: ProjectType,
            as: 'projectType',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      return this.response(res, 201, true, "درخواست بازرسی با موفقیت ثبت شد", createdRequest);
    } catch (error) {
      console.error('Error in create:', error);
      return this.response(res, 500, false, "خطا در ثبت درخواست", null, error.message);
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, review_notes } = req.body;
      const reviewerId = req.user?.id || 1; // از middleware احراز هویت یا کاربر پیش‌فرض

      const request = await InspectionRequest.findByPk(id);
      if (!request) {
        return this.response(res, 404, false, "درخواست مورد نظر یافت نشد");
      }

      const validStatuses = ['pending', 'reviewed', 'approved', 'rejected', 'archived'];
      if (!validStatuses.includes(status)) {
        return this.response(res, 400, false, "وضعیت نامعتبر است");
      }

      await request.update({
        status,
        review_notes: review_notes || null,
        reviewed_by: reviewerId || null,
        reviewed_at: new Date()
      });

      return this.response(res, 200, true, "وضعیت درخواست با موفقیت به‌روزرسانی شد", request);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      return this.response(res, 500, false, "خطا در به‌روزرسانی وضعیت", null, error.message);
    }
  }

  async convertToCustomer(req, res) {
    try {
      const { id } = req.params;
      const { nationalId, email, username, password } = req.body;

      const request = await InspectionRequest.findByPk(id);
      if (!request) {
        return this.response(res, 404, false, "درخواست مورد نظر یافت نشد");
      }

      if (request.customer_id) {
        return this.response(res, 400, false, "این درخواست قبلاً به مشتری تبدیل شده است");
      }

      const sequelize = require("../../../core/database/mysql/connection");
      const Role = require("../../user/role/model");
      const t = await sequelize.transaction();

      try {
        // ایجاد مشتری جدید
        const customer = await User.create({
          firstName: request.firstName,
          lastName: request.lastName,
          nationalId: nationalId || null,
          mobile: request.mobile,
          username: username || request.mobile,
          email: email || null,
          password: password || request.mobile,
          isActive: true,
          type: 'person' // پیش‌فرض حقیقی
        }, { transaction: t });

        // اضافه کردن نقش مشتری
        const customerRole = await Role.findOne({ where: { nameEn: 'Customer' }, transaction: t });
        if (customerRole && customer.addRole) {
          await customer.addRole(customerRole, { transaction: t });
        }

        // به‌روزرسانی درخواست
        await request.update({
          customer_id: customer.id,
          status: 'approved'
        }, { transaction: t });

        await t.commit();
        return this.response(res, 200, true, "درخواست با موفقیت به مشتری تبدیل شد", {
          request,
          customer: {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            mobile: customer.mobile
          }
        });
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (error) {
      console.error('Error in convertToCustomer:', error);
      return this.response(res, 500, false, "خطا در تبدیل به مشتری", null, error.message);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const request = await InspectionRequest.findByPk(id);
      
      if (!request) {
        return this.response(res, 404, false, "درخواست مورد نظر یافت نشد");
      }

      await request.destroy();
      return this.response(res, 200, true, "درخواست با موفقیت حذف شد");
    } catch (error) {
      console.error('Error in delete:', error);
      return this.response(res, 500, false, "خطا در حذف درخواست", null, error.message);
    }
  }

  async convertToProject(req, res) {
    try {
      const { id } = req.params;
      const sequelize = require("../../../core/database/mysql/connection");
      const Role = require("../../user/role/model");
      
      const t = await sequelize.transaction();
      try {
        // دریافت درخواست بازرسی
        const inspectionRequest = await InspectionRequest.findByPk(id, {
          include: [
            {
              model: ProjectType,
              as: 'projectType',
              attributes: ['id', 'name', 'code']
            }
          ],
          transaction: t
        });

        if (!inspectionRequest) {
          await t.rollback();
          return this.response(res, 404, false, "درخواست بازرسی یافت نشد");
        }

        // پیدا کردن یا ایجاد کاربر
        let user = await User.findOne({ 
          where: { mobile: inspectionRequest.mobile }, 
          transaction: t 
        });
        
        if (!user) {
          user = await User.create({
            firstName: inspectionRequest.firstName,
            lastName: inspectionRequest.lastName,
            mobile: inspectionRequest.mobile,
            username: inspectionRequest.mobile,
            email: null,
            password: inspectionRequest.mobile, // placeholder (hashed via hook)
            isActive: true,
          }, { transaction: t });
          
          // اضافه کردن نقش مشتری
          const customerRole = await Role.findOne({ where: { nameEn: 'Customer' }, transaction: t });
          if (customerRole && user.addRole) {
            await user.addRole(customerRole, { transaction: t });
          }
        }

        // ایجاد پروژه
        const project = await Project.create({
          customer_id: user.id,
          project_type_id: inspectionRequest.project_type_id,
          client_name: `${inspectionRequest.firstName} ${inspectionRequest.lastName}`.trim(),
          client_contact: inspectionRequest.mobile || '',
          status: 'requested',
          meta: { 
            converted_from_inspection_request: true,
            original_inspection_request_id: inspectionRequest.id 
          },
          request_payload: inspectionRequest.request_payload || null,
        }, { transaction: t });

        // به‌روزرسانی وضعیت درخواست بازرسی
        await inspectionRequest.update({
          status: 'approved',
          project_id: project.id,
          reviewed_by: req.user?.userId || null,
          reviewed_at: new Date(),
          review_notes: 'تبدیل به پروژه'
        }, { transaction: t });

        await t.commit();
        
        return this.response(res, 201, true, "درخواست با موفقیت به پروژه تبدیل شد", {
          project: project,
          inspectionRequest: inspectionRequest
        });
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (error) {
      console.error('Error in convertToProject:', error);
      return this.response(res, 500, false, "خطا در تبدیل درخواست به پروژه", null, error.message);
    }
  }

  async getConverted(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        project_id: { [require('sequelize').Op.ne]: null } // درخواست‌هایی که تبدیل شده‌اند
      };

      const { count, rows } = await InspectionRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ProjectType,
            as: 'projectType',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'reviewer',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return this.response(res, 200, true, "درخواست‌های تبدیل شده با موفقیت دریافت شدند", {
        requests: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error in getConverted:', error);
      return this.response(res, 500, false, "خطا در دریافت درخواست‌های تبدیل شده", null, error.message);
    }
  }
}

module.exports = new InspectionRequestController();
