const User = require("./user/model");
const Role = require("./role/model");
const UserRole = require("./userRole/model");

const defineUserAssociations = () => {
  // Many-to-Many association between User and Role
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    as: 'roles',
  });
  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    as: 'users',
  });
};

module.exports = defineUserAssociations; 