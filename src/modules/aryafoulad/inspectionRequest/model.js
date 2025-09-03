const { DataTypes } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

const InspectionRequest = sequelize.define(
  "InspectionRequest",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    firstName: { 
      type: DataTypes.STRING(255), 
      allowNull: false,
      comment: 'نام درخواست‌کننده'
    },
    lastName: { 
      type: DataTypes.STRING(255), 
      allowNull: false,
      comment: 'نام خانوادگی درخواست‌کننده'
    },
    mobile: { 
      type: DataTypes.STRING(20), 
      allowNull: false,
      comment: 'شماره موبایل درخواست‌کننده'
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'توضیحات درخواست (اختیاری)'
    },
    project_type_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'نوع پروژه درخواستی'
    },
    request_payload: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'اطلاعات اضافی درخواست (فرم‌های پویا)'
    },
    status: {
      type: DataTypes.ENUM(
        "pending",      // در انتظار بررسی
        "reviewed",     // بررسی شده
        "approved",     // تایید شده
        "rejected",     // رد شده
        "archived"      // آرشیو شده
      ),
      defaultValue: "pending",
      comment: 'وضعیت درخواست'
    },
    reviewed_by: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'شناسه کاربری که درخواست را بررسی کرده'
    },
    reviewed_at: { 
      type: DataTypes.DATE, 
      allowNull: true,
      comment: 'تاریخ بررسی درخواست'
    },
    review_notes: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'یادداشت‌های بررسی'
    },
    customer_id: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'شناسه مشتری (در صورت تبدیل به مشتری)'
    },
    project_id: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'شناسه پروژه (در صورت تبدیل به پروژه)'
    }
  },
  { 
    tableName: "inspection_requests", 
    timestamps: true,
    comment: 'درخواست‌های بازرسی'
  }
);

module.exports = InspectionRequest;
