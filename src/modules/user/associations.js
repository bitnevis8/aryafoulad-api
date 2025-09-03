const User = require("./user/model");
const Role = require("./role/model");
const UserRole = require("./userRole/model");
const CustomerCompany = require("./customerCompany/model");

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

  // One-to-Many association between User and CustomerCompany
  User.hasMany(CustomerCompany, {
    foreignKey: 'customerId',
    as: 'companies',
  });
  CustomerCompany.belongsTo(User, {
    foreignKey: 'customerId',
    as: 'customer',
  });
};

module.exports = defineUserAssociations; 