// تعریف associations برای InspectionRequest
function defineAryafouladAssociations() {
  const InspectionRequest = require("./inspectionRequest/model");
  const ProjectType = require("./projects/models").ProjectType;
  const User = require("../user/user/model");

  // تعریف associations برای InspectionRequest
  InspectionRequest.belongsTo(ProjectType, {
    foreignKey: 'project_type_id',
    as: 'projectType'
  });

  InspectionRequest.belongsTo(User, {
    foreignKey: 'reviewed_by',
    as: 'reviewer'
  });

  InspectionRequest.belongsTo(User, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
}

module.exports = defineAryafouladAssociations;
