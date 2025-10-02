const User = require("./model");
const Role = require("../role/model");
const seederData = require("./seederData.json");

async function seedUsers() {
  try {
    for (const userData of seederData) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });

      // اختیاری: اختصاص نقش‌ها بر اساس نام نقش در داده سیدر
      if (Array.isArray(userData.roles) && userData.roles.length > 0) {
        const roles = await Role.findAll({ where: { name: userData.roles } });
        if (roles?.length) {
          await user.setRoles(roles);
        }
      }
    }
    console.log("✅ Users seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}

module.exports = seedUsers;
