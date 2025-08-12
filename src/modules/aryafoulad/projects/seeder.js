const { ProjectType, ProjectFormTemplate } = require("./models");
const data = require("./seederData.json");

async function seedProjectTypes() {
  for (const item of data.projectTypes) {
    await ProjectType.findOrCreate({ where: { code: item.code }, defaults: item });
  }
}

async function seedFormTemplates() {
  for (const item of data.formTemplates) {
    await ProjectFormTemplate.findOrCreate({
      where: { code: item.code },
      defaults: item,
    });
  }
}

async function seed() {
  await seedProjectTypes();
  await seedFormTemplates();
}

module.exports = { seed };

