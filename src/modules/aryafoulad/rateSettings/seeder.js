const RateSetting = require('./model');

const rateSettingsData = [
  {
    title: 'نرخ فروردین 1400 تا مرداد 1400',
    ratePerKm: 2000,
    startDate: '2021-03-21', // 1 فروردین 1400
    endDate: '2021-08-18',   // 27 مرداد 1400
    description: 'نرخ پایه برای دوره اول سال 1400',
    isActive: true
  },
  {
    title: 'نرخ مرداد 1400 تا فروردین 1401',
    ratePerKm: 2800,
    startDate: '2021-08-19', // 28 مرداد 1400
    endDate: '2022-03-21',   // 1 فروردین 1401
    description: 'نرخ افزایش یافته برای دوره دوم سال 1400',
    isActive: true
  },
  {
    title: 'نرخ فروردین 1401 تا الان',
    ratePerKm: 5000,
    startDate: '2022-03-22', // 2 فروردین 1401
    endDate: null,           // فقط این یکی بدون پایان
    description: 'نرخ فعلی برای محاسبات ماموریت‌ها',
    isActive: true
  }
];

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