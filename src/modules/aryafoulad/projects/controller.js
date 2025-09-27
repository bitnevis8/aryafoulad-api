const BaseController = require("../../../core/baseController");
const { Project, ProjectType, ProjectFormTemplate, ProjectFormSubmission, ProjectCostItem, ProjectPayment, ProjectInspection } = require("./models");
const User = require("../../user/user/model");

class ProjectsController extends BaseController {
  async getAllProjects(req, res) {
    try {
      const { q, firstName, lastName, nationalId, mobile, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
      const { Op } = require('sequelize');
      const order = [[sortBy, sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];

      const customerWhere = {};
      const customerOr = [];
      if (q) {
        customerOr.push(
          { firstName: { [Op.like]: `%${q}%` } },
          { lastName: { [Op.like]: `%${q}%` } },
          { nationalId: { [Op.like]: `%${q}%` } },
          { mobile: { [Op.like]: `%${q}%` } }
        );
      }
      if (firstName) customerOr.push({ firstName: { [Op.like]: `%${firstName}%` } });
      if (lastName) customerOr.push({ lastName: { [Op.like]: `%${lastName}%` } });
      if (nationalId) customerOr.push({ nationalId: { [Op.like]: `%${nationalId}%` } });
      if (mobile) customerOr.push({ mobile: { [Op.like]: `%${mobile}%` } });
      if (customerOr.length) customerWhere[Op.or] = customerOr;

      const projectWhere = {};
      if (q) projectWhere[Op.or] = [{ client_name: { [Op.like]: `%${q}%` } }];

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const pageLimit = parseInt(limit);

      const include = [
        { model: ProjectType, as: 'type' },
        customerOr.length ? { model: User, as: 'customer', where: customerWhere, required: true } : { model: User, as: 'customer', required: false }
      ];

      const { count, rows } = await Project.findAndCountAll({
        where: projectWhere,
        include,
        order,
        limit: pageLimit,
        offset
      });

      return this.response(res, 200, true, "OK", { items: rows, pagination: { total: count, page: parseInt(page), limit: pageLimit } });
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }
  async getAllProjectTypes(req, res) {
    try {
      let items = await ProjectType.findAll({ order: [["id", "ASC"]] });
      
      // اگر هیچ نوع پروژه‌ای وجود ندارد، انواع پیش‌فرض را ایجاد کن
      if (items.length === 0) {
        const defaultTypes = [
          { code: "CRANE_INSPECTION", name: "بازرسی جرثقیل" },
          { code: "HIC_TEST", name: "تست جذب ضربه (HIC)" },
          { code: "PE_PIPE_TEST", name: "تست لوله پلی‌اتیلن (لهیدگی/گاز)" },
          { code: "PLAYGROUND_EARTH_WELD", name: "بازرسی ارت" }
        ];
        
        for (const type of defaultTypes) {
          await ProjectType.create(type);
        }
        
        items = await ProjectType.findAll({ order: [["id", "ASC"]] });
      }
      
      return this.response(res, 200, true, "OK", items);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async findCustomerAndProjects(req, res) {
    try {
      const { nationalId, mobile } = req.query;
      if (!nationalId && !mobile) return this.response(res, 400, false, 'کد ملی یا موبایل الزامی است');
      const where = {};
      if (nationalId) where.nationalId = nationalId;
      if (mobile) where.mobile = mobile;
      const customer = await User.findOne({ where });
      if (!customer) return this.response(res, 404, false, 'مشتری یافت نشد');
      const projects = await Project.findAll({ where: { customer_id: customer.id }, order: [['createdAt','DESC']], include: [{ model: ProjectType, as: 'type' }] });
      return this.response(res, 200, true, 'OK', { customer, projects });
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }
  async getFormTemplateByCode(req, res) {
    try {
      const { code } = req.params;
      const item = await ProjectFormTemplate.findOne({ where: { code } });
      if (!item) return this.response(res, 404, false, "فرم یافت نشد");
      return this.response(res, 200, true, "OK", item);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async createProjectRequest(req, res) {
    try {
      const value = req.body; // { firstName, lastName, mobile, nationalId, companyName?, project_type_id, request_payload }
      const sequelize = require("../../../core/database/mysql/connection");
      const Role = require("../../user/role/model");
      const t = await sequelize.transaction();
      try {
        // find or create customer by nationalId
        let user = await User.findOne({ where: { nationalId: value.nationalId }, transaction: t });
        if (!user) {
          user = await User.create({
            firstName: value.firstName,
            lastName: value.lastName,
            nationalId: value.nationalId,
            mobile: value.mobile || null,
            username: value.mobile || value.nationalId,
            email: null,
            password: value.nationalId, // placeholder (hashed via hook)
            isActive: true,
          }, { transaction: t });
          // add customer role
          const customerRole = await Role.findOne({ where: { nameEn: 'Customer' }, transaction: t });
          if (customerRole && user.addRole) await user.addRole(customerRole, { transaction: t });
        }

        // create project
        const project = await Project.create({
          customer_id: user.id,
          project_type_id: value.project_type_id,
          client_name: `${value.firstName} ${value.lastName}`.trim(),
          client_contact: value.mobile || '',
          status: 'requested',
          meta: { companyName: value.companyName || null },
          request_payload: value.request_payload || null,
        }, { transaction: t });

        await t.commit();
        return this.response(res, 201, true, "درخواست پروژه ثبت شد", project);
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findByPk(id, { include: [
        { model: ProjectType, as: 'type' },
        { model: ProjectFormSubmission, as: 'submissions' },
        { model: ProjectCostItem, as: 'costItems' },
        { model: ProjectPayment, as: 'payments' },
        { model: ProjectInspection, as: 'inspections' }
      ] });
      if (!project) return this.response(res, 404, false, "پروژه یافت نشد");
      // compute totals
      const costTotal = (project.costItems || []).reduce((sum, it) => sum + Number(it.amount || 0), 0);
      const paidTotal = (project.payments || []).reduce((sum, it) => sum + Number(it.amount || 0), 0);
      const balance = costTotal - paidTotal;
      const result = project.toJSON();
      result.totals = { costTotal, paidTotal, balance };
      return this.response(res, 200, true, "OK", result);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async getFormSubmissionsByProject(req, res) {
    try {
      const { projectId } = req.params;
      const items = await ProjectFormSubmission.findAll({
        where: { project_id: projectId },
        order: [["createdAt", "DESC"]]
      });
      return this.response(res, 200, true, "OK", items);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async submitForm(req, res) {
    try {
      const value = req.body; // { project_id, template_code, data }
      const template = await ProjectFormTemplate.findOne({ where: { code: value.template_code } });
      if (!template) return this.response(res, 404, false, "فرم معتبر نیست");
      const submission = await ProjectFormSubmission.create({
        project_id: value.project_id,
        template_code: value.template_code,
        data: value.data,
        version: template.version,
      });
      return this.response(res, 201, true, "ثبت شد", submission);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async getFormSubmissionById(req, res) {
    try {
      const { id } = req.params;
      const submission = await ProjectFormSubmission.findByPk(id);
      if (!submission) return this.response(res, 404, false, "یافت نشد");
      return this.response(res, 200, true, "OK", submission);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  async updateProjectStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const allowed = [
        "requested",
        "quoted",
        "scheduled",
        "inspecting",
        "reporting",
        "approved",
        "rejected"
      ];
      if (!allowed.includes(status)) {
        return this.response(res, 400, false, "وضعیت نامعتبر است");
      }
      const project = await Project.findByPk(id);
      if (!project) return this.response(res, 404, false, "پروژه یافت نشد");
      project.status = status;
      await project.save();
      return this.response(res, 200, true, "وضعیت به‌روزرسانی شد", project);
    } catch (error) {
      return this.response(res, 500, false, "خطای داخلی سرور", null, error);
    }
  }

  // Cost items
  async addCostItem(req, res) {
    try {
      const { project_id, title, amount, note } = req.body;
      const item = await ProjectCostItem.create({ project_id, title, amount, note });
      return this.response(res, 201, true, 'هزینه ثبت شد', item);
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }

  async removeCostItem(req, res) {
    try {
      const { id } = req.params;
      const item = await ProjectCostItem.findByPk(id);
      if (!item) return this.response(res, 404, false, 'یافت نشد');
      await item.destroy();
      return this.response(res, 200, true, 'حذف شد');
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }

  // Payments
  async addPayment(req, res) {
    try {
      const { project_id, payer_name, amount, paid_at, invoice_no, description, attachment_file_id } = req.body;
      const payment = await ProjectPayment.create({ project_id, payer_name, amount, paid_at, invoice_no, description, attachment_file_id });
      return this.response(res, 201, true, 'پرداخت ثبت شد', payment);
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }

  async removePayment(req, res) {
    try {
      const { id } = req.params;
      const payment = await ProjectPayment.findByPk(id);
      if (!payment) return this.response(res, 404, false, 'یافت نشد');
      await payment.destroy();
      return this.response(res, 200, true, 'حذف شد');
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }

  // Inspections
  async createInspection(req, res) {
    try {
      const { project_id, scheduled_at, assigned_user_ids, notes, status } = req.body;
      const inspection = await ProjectInspection.create({ project_id, scheduled_at, assigned_user_ids: assigned_user_ids || [], notes, status: status || 'scheduled' });
      return this.response(res, 201, true, 'بازرسی زمان‌بندی شد', inspection);
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }

  async getInspectionsCalendar(req, res) {
    try {
      const { from, to, scope } = req.query;
      const where = {};
      const { Op } = require('sequelize');
      if (from || to) {
        where.scheduled_at = {};
        if (from) where.scheduled_at[Op.gte] = new Date(from);
        if (to) where.scheduled_at[Op.lte] = new Date(to);
      }
      if (scope === 'today') {
        const s = new Date(); s.setHours(0,0,0,0);
        const e = new Date(); e.setHours(23,59,59,999);
        where.scheduled_at = { [Op.gte]: s, [Op.lte]: e };
      } else if (scope === 'tomorrow') {
        const s = new Date(); s.setDate(s.getDate()+1); s.setHours(0,0,0,0);
        const e = new Date(); e.setDate(e.getDate()+1); e.setHours(23,59,59,999);
        where.scheduled_at = { [Op.gte]: s, [Op.lte]: e };
      } else if (scope === 'upcoming') {
        // از همین امروز (شروع روز) تا یک هفته آینده
        const s = new Date(); s.setHours(0,0,0,0);
        const e = new Date(); e.setDate(e.getDate()+7); e.setHours(23,59,59,999);
        where.scheduled_at = { [Op.gte]: s, [Op.lte]: e };
      } else if (scope === 'done') {
        // تاریخ گذشته: هر چیزی که زمانش قبل از اکنون است
        const now = new Date();
        where.scheduled_at = { [Op.lt]: now };
      }
      const items = await ProjectInspection.findAll({ where, include: [{ model: Project, as: 'project', include: [{ model: ProjectType, as: 'type' }] }], order: [['scheduled_at','ASC']] });

      // Enrich with assigned users details
      const allIds = Array.from(new Set(items.flatMap(it => Array.isArray(it.assigned_user_ids) ? it.assigned_user_ids : [])));
      let usersMap = new Map();
      if (allIds.length) {
        const users = await User.findAll({ where: { id: allIds } });
        usersMap = new Map(users.map(u => [u.id, u]));
      }
      const enriched = items.map(it => {
        const json = it.toJSON();
        const details = (json.assigned_user_ids || []).map(uid => {
          const u = usersMap.get(uid);
          return u ? {
            id: u.id,
            name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email || u.mobile,
            mobile: u.mobile || u.phone || null,
          } : { id: uid, name: String(uid), mobile: null };
        });
        json.assigned_users = details;
        return json;
      });

      return this.response(res, 200, true, 'OK', enriched);
    } catch (error) {
      return this.response(res, 500, false, 'خطای داخلی سرور', null, error);
    }
  }

  async updateFormSubmission(req, res) {
    try {
      const { id } = req.params;
      const { data } = req.body;

      const formSubmission = await ProjectFormSubmission.findByPk(id);
      if (!formSubmission) {
        return this.response(res, 404, false, "گزارش یافت نشد");
      }

      await formSubmission.update({
        data: data,
        updatedAt: new Date()
      });

      return this.response(res, 200, true, "گزارش با موفقیت به‌روزرسانی شد", formSubmission);
    } catch (error) {
      console.error('Error in updateFormSubmission:', error);
      return this.response(res, 500, false, "خطا در به‌روزرسانی گزارش", null, error.message);
    }
  }

  async deleteFormSubmission(req, res) {
    try {
      const { id } = req.params;

      const formSubmission = await ProjectFormSubmission.findByPk(id);
      if (!formSubmission) {
        return this.response(res, 404, false, "گزارش یافت نشد");
      }

      await formSubmission.destroy();
      return this.response(res, 200, true, "گزارش با موفقیت حذف شد");
    } catch (error) {
      console.error('Error in deleteFormSubmission:', error);
      return this.response(res, 500, false, "خطا در حذف گزارش", null, error.message);
    }
  }
}

module.exports = new ProjectsController();

