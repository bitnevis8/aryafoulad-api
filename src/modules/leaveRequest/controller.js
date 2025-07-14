const LeaveRequest = require('./model');
const User = require('../user/user/model');
const { Op } = require('sequelize');
const Role = require('../user/role/model');
const UserRole = require('../user/userRole/model');



// تابع کمکی برای دریافت نقش‌های کاربر از دیتابیس یا JWT
const getUserRoles = async (userId, jwtRoles = []) => {
  try {
    // ابتدا از JWT استفاده می‌کنیم (اگر موجود باشد)
    if (jwtRoles && jwtRoles.length > 0) {
      console.log('Using roles from JWT:', jwtRoles.map(r => r.name));
      return jwtRoles.map(r => r.name);
    }
    
    // اگر JWT نقش‌ها را نداشت، از دیتابیس می‌گیریم
    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
    
    const roles = userRoles.map(ur => ur.role.name);
    console.log('Using roles from DB:', roles);
    return roles;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

const LeaveRequestController = {
  // ثبت درخواست مرخصی
  async create(req, res) {
    try {
      const { startDate, endDate, startTime, endTime, type, description, isHourly } = req.body;
      const userId = req.user.userId || req.user.id;
      
      // اعتبارسنجی نوع مرخصی
      const validTypes = ['annual', 'sick', 'unpaid'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'نوع مرخصی نامعتبر است. انواع مجاز: annual, sick, unpaid' 
        });
      }
      
      // محاسبه تعداد روزها یا ساعت‌ها
      let daysCount = 0;
      if (isHourly && startTime && endTime) {
        // محاسبه بر اساس ساعت
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        const diffHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
        daysCount = parseFloat((diffHours / 8).toFixed(2)); // تبدیل به روز کاری (8 ساعت)
      } else {
        // محاسبه بر اساس روز
        daysCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      const leave = await LeaveRequest.create({
        userId,
        startDate,
        endDate,
        startTime: isHourly ? startTime : null,
        endTime: isHourly ? endTime : null,
        daysCount,
        isHourly: isHourly || false,
        type,
        description,
        status: 'pending',
      });
      res.json({ success: true, data: leave });
    } catch (error) {
      res.status(500).json({ success: false, message: 'خطا در ثبت مرخصی', error });
    }
  },

  // مشاهده درخواست‌های خود کاربر
  async getMyRequests(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const requests = await LeaveRequest.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
      res.json({ success: true, data: requests });
    } catch (error) {
      res.status(500).json({ success: false, message: 'خطا در دریافت لیست مرخصی', error });
    }
  },

  // مشاهده همه درخواست‌ها (فقط برای ستادی و مدیر کل)
  async getAll(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      console.log('getAll called by user:', userId);
      
      // دریافت نقش‌های کاربر از JWT یا دیتابیس
      const userRoles = await getUserRoles(userId, req.user.roles);
      console.log('User roles:', userRoles);
      
      // بررسی دسترسی
      if (!userRoles.includes('staff') && !userRoles.includes('super_admin')) {
        return res.status(403).json({ 
          success: false, 
          message: 'دسترسی ندارید. برای مشاهده درخواست‌ها نیاز به نقش ستادی یا مدیر کل دارید.' 
        });
      }
      
      // ابتدا بدون include تست کنیم
      const requests = await LeaveRequest.findAll({ 
        order: [['createdAt', 'DESC']] 
      });
      
      console.log('Found requests without include:', requests.length);
      
      // اگر درخواستی وجود دارد، اطلاعات کاربر را جداگانه دریافت کنیم
      if (requests.length > 0) {
        const requestsWithUser = await Promise.all(
          requests.map(async (request) => {
            try {
              const user = await User.findByPk(request.userId, {
                attributes: ['id', 'firstName', 'lastName', 'email']
              });
              return {
                ...request.toJSON(),
                user: user ? user.toJSON() : null
              };
            } catch (error) {
              console.error('Error fetching user for request:', request.id, error);
              return {
                ...request.toJSON(),
                user: null
              };
            }
          })
        );
        
        console.log('Found requests with user data:', requestsWithUser.length);
        res.json({ success: true, data: requestsWithUser });
      } else {
        res.json({ success: true, data: [] });
      }
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({ success: false, message: 'خطا در دریافت لیست مرخصی', error: error.message });
    }
  },

  // تایید یا رد توسط ستادی یا مدیر کل
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { action, reason, approvalType } = req.body; // action: approve/reject, approvalType: staff/admin
      const userId = req.user.userId || req.user.id;
      
      console.log('Approve called with:', { id, action, reason, approvalType, userId });
      
      // دریافت نقش‌های کاربر از JWT یا دیتابیس
      const userRoles = await getUserRoles(userId, req.user.roles);
      console.log('User roles:', userRoles);
      
      const leave = await LeaveRequest.findByPk(id);
      if (!leave) return res.status(404).json({ success: false, message: 'درخواست یافت نشد' });
      
      console.log('Current leave status:', leave.status);
      
      // بررسی دسترسی بر اساس نوع تایید
      let canApprove = false;
      let canReject = false;
      
      if (approvalType === 'staff') {
        // تایید ستادی
        if (userRoles.includes('staff') || userRoles.includes('super_admin')) {
          canApprove = true;
          canReject = true;
        }
      } else if (approvalType === 'admin') {
        // تایید مدیریت
        if (userRoles.includes('super_admin')) {
          canApprove = true;
          canReject = true;
        }
      }
      
      if (!canApprove && !canReject) {
        return res.status(403).json({ 
          success: false, 
          message: 'دسترسی ندارید. برای تایید/رد درخواست نیاز به نقش مناسب دارید.' 
        });
      }
      
      if (action === 'approve') {
        if (approvalType === 'staff') {
          // تایید ستادی
          leave.status = 'staff_approved';
          leave.staffApproverId = userId;
          leave.staffApprovalDate = new Date();
        } else if (approvalType === 'admin') {
          // تایید مدیریت
          leave.status = 'final_approved';
          leave.finalApproverId = userId;
          leave.finalApprovalDate = new Date();
        }
      } else if (action === 'reject') {
        if (approvalType === 'staff') {
          // رد ستادی
          leave.status = 'staff_rejected';
          leave.staffApproverId = userId;
          leave.staffApprovalDate = new Date();
          leave.rejectReason = reason;
        } else if (approvalType === 'admin') {
          // رد مدیریت
          leave.status = 'final_rejected';
          leave.finalApproverId = userId;
          leave.finalApprovalDate = new Date();
          leave.rejectReason = reason;
        }
      }
      
      await leave.save();
      res.json({ success: true, data: leave });
    } catch (error) {
      console.error('Error in approve:', error);
      res.status(500).json({ success: false, message: 'خطا در تایید/رد مرخصی', error: error.message });
    }
  },

  // گزارش‌گیری ساده
  async report(req, res) {
    try {
      const currentUserId = req.user.userId || req.user.id;
      
      // دریافت نقش‌های کاربر از JWT یا دیتابیس
      const userRoles = await getUserRoles(currentUserId, req.user.roles);
      
      // بررسی دسترسی
      if (!userRoles.includes('staff') && !userRoles.includes('super_admin')) {
        return res.status(403).json({ 
          success: false, 
          message: 'دسترسی ندارید. برای گزارش‌گیری نیاز به نقش ستادی یا مدیر کل دارید.' 
        });
      }
      
      const { userId, status, type, from, to } = req.query;
      const where = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;
      if (type) where.type = type;
      if (from && to) where.startDate = { [Op.between]: [from, to] };
      
      const requests = await LeaveRequest.findAll({ 
        where, 
        include: [{ model: User, as: 'user' }], 
        order: [['createdAt', 'DESC']] 
      });
      
      res.json({ success: true, data: requests });
    } catch (error) {
      console.error('Error in report:', error);
      res.status(500).json({ success: false, message: 'خطا در گزارش‌گیری', error: error.message });
    }
  },

  // دریافت لیست انواع مرخصی (ENUM values)
  getTypes(req, res) {
    try {
      // تعریف انواع مرخصی بر اساس ENUM مدل
      const types = [
        { type: 'annual', typeFa: 'استحقاقی' },
        { type: 'sick', typeFa: 'استعلاجی' },
        { type: 'unpaid', typeFa: 'بدون حقوق' }
      ];
      
      res.json({ success: true, data: types });
    } catch (error) {
      console.error('Error getting leave types:', error);
      res.status(500).json({ success: false, message: 'خطا در دریافت انواع مرخصی' });
    }
  },
};

module.exports = LeaveRequestController; 