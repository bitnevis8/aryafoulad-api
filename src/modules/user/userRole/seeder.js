const User = require("../user/model");
const Role = require("../role/model");
const UserRole = require("./model");
const seederData = require("./seederData.json");

const seedUserRoles = async () => {
  try {
    for (const entry of seederData) {
      if (entry.email && (entry.role || entry.roleName)) {
        // New format: assign by email and role name for stability
        const user = await User.findOne({ where: { email: entry.email } });
        const role = await Role.findOne({ where: { name: entry.role || entry.roleName } });
        if (user && role) {
          await user.addRoles([role]);
        }
      } else if (entry.userId && entry.roleId) {
        // Legacy format: direct IDs (kept for backward compatibility)
        await UserRole.findOrCreate({ where: { userId: entry.userId, roleId: entry.roleId }, defaults: entry });
      }
    }
    console.log("✅ User roles seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding user roles:", error);
    throw error;
  }
};

module.exports = seedUserRoles;