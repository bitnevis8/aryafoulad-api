const RateSetting = require('./model');

const rateSettingsData = [];

async function seed() {
  try {
    console.log('🌱 Seeding rate settings...');
    await RateSetting.destroy({ where: {} });
    console.log('✅ Existing rate settings cleared');
    const createdRates = await RateSetting.bulkCreate(rateSettingsData);
    console.log(`✅ ${createdRates.length} rate settings created successfully`);
    createdRates.forEach(rate => {
      console.log(`   - ${rate.title}: ${rate.ratePerKm} تومان (${rate.isActive ? 'فعال' : 'غیرفعال'})`);
    });
    console.log('🎉 Rate settings seeding completed!');
    return createdRates;
  } catch (error) {
    console.error('❌ Error seeding rate settings:', error);
    throw error;
  }
}

module.exports = { seed }; 