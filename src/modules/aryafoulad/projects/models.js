const { DataTypes } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

// Project Types (e.g., Crane Inspection, HIC Test, PE Pipe Test, Playground Earthing & Weld Inspection)
const ProjectType = sequelize.define(
  "ProjectType",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(64), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "project_types", timestamps: true }
);

// Projects
const Project = sequelize.define(
  "Project",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_type_id: { type: DataTypes.INTEGER, allowNull: false },
    customer_id: { type: DataTypes.INTEGER, allowNull: true },
    client_name: { type: DataTypes.STRING(255), allowNull: false },
    client_contact: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "requested",
        "quoted",
        "scheduled",
        "inspecting",
        "reporting",
        "approved",
        "rejected"
      ),
      defaultValue: "requested",
    },
    request_payload: { type: DataTypes.JSON, allowNull: true },
    meta: { type: DataTypes.JSON, allowNull: true },
  },
  { tableName: "projects", timestamps: true }
);

// Form Templates (versioned JSON schema per type and stage)
const ProjectFormTemplate = sequelize.define(
  "ProjectFormTemplate",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    project_type_code: { type: DataTypes.STRING(64), allowNull: false },
    version: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "R0" },
    schema: { type: DataTypes.JSON, allowNull: false },
  },
  { tableName: "project_form_templates", timestamps: true }
);

// Form Submissions
const ProjectFormSubmission = sequelize.define(
  "ProjectFormSubmission",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    template_code: { type: DataTypes.STRING(64), allowNull: false },
    version: { type: DataTypes.STRING(16), allowNull: false },
    data: { type: DataTypes.JSON, allowNull: false },
  },
  { tableName: "project_form_submissions", timestamps: true }
);

// Associations (defined locally; also can be centralized later)
Project.belongsTo(ProjectType, { foreignKey: "project_type_id", as: "type" });
ProjectType.hasMany(Project, { foreignKey: "project_type_id", as: "projects" });
// late require to avoid circular
const User = require("../../user/user/model");
Project.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

ProjectFormSubmission.belongsTo(Project, { foreignKey: "project_id", as: "project" });
Project.hasMany(ProjectFormSubmission, { foreignKey: "project_id", as: "submissions" });

// Quotation items (cost lines) and payments
const ProjectCostItem = sequelize.define(
  "ProjectCostItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15,2), allowNull: false, defaultValue: 0 },
    note: { type: DataTypes.STRING(512), allowNull: true },
  },
  { tableName: "project_cost_items", timestamps: true }
);

const ProjectPayment = sequelize.define(
  "ProjectPayment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    payer_name: { type: DataTypes.STRING(255), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15,2), allowNull: false },
    paid_at: { type: DataTypes.DATE, allowNull: false },
    invoice_no: { type: DataTypes.STRING(128), allowNull: true },
    description: { type: DataTypes.STRING(512), allowNull: true },
    attachment_file_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "project_payments", timestamps: true }
);

ProjectCostItem.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(ProjectCostItem, { foreignKey: 'project_id', as: 'costItems' });
ProjectPayment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(ProjectPayment, { foreignKey: 'project_id', as: 'payments' });

// Inspection schedule
const ProjectInspection = sequelize.define(
  "ProjectInspection",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    assigned_user_ids: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    status: { type: DataTypes.ENUM('scheduled','in_progress','done','canceled'), allowNull: false, defaultValue: 'scheduled' },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.STRING(512), allowNull: true },
  },
  { tableName: "project_inspections", timestamps: true }
);

ProjectInspection.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(ProjectInspection, { foreignKey: 'project_id', as: 'inspections' });

module.exports = { ProjectType, Project, ProjectFormTemplate, ProjectFormSubmission, ProjectCostItem, ProjectPayment, ProjectInspection };
 

