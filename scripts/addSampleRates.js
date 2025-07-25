const RateSetting = require('../src/modules/aryafoulad/rateSettings/model');

async function addSampleRates() {
  const sampleRates = [
    {
      title: 'نرخ ویژه ماموریت‌های اضطراری',
      ratePerKm: 45000,
      startDate: '2025-03-21', // 1 فروردین 1404
      endDate: '2025-12-29',   // 8 دی 1404
      description: 'نرخ بالاتر برای ماموریت‌های اضطراری و فوری',
      isActive: false
    },
    {
      title: 'نرخ ماموریت‌های شبانه',
      ratePerKm: 40000,
      startDate: '2025-03-21', // 1 فروردین 1404
      endDate: '2025-12-29',   // 8 دی 1404
      description: 'نرخ ویژه برای ماموریت‌های شبانه (22:00 تا 06:00)',
      isActive: false
    },
    {
      title: 'نرخ ماموریت‌های تعطیلات',
      ratePerKm: 38000,
      startDate: '2025-03-21', // 1 فروردین 1404
      endDate: '2025-12-29',   // 8 دی 1404
      description: 'نرخ ویژه برای ماموریت‌های روزهای تعطیل',
      isActive: false
    }
  ];

  await RateSetting.bulkCreate(sampleRates);
  console.log('✅ نرخ‌های نمونه با موفقیت اضافه شدند.');
  console.log('📋 نرخ‌های اضافه شده:');
  sampleRates.forEach(rate => {
    console.log(`   - ${rate.title}: ${rate.ratePerKm.toLocaleString()} تومان`);
  });
  process.exit(0);
}

addSampleRates(); 