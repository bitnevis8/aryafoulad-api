const RateSetting = require('../src/modules/aryafoulad/rateSettings/model');

async function resetRates() {
  await RateSetting.destroy({ where: {} });

  const rates = [
    {
      title: 'نرخ سال ۱۴۰۴ تا الان',
      ratePerKm: 33500,
      startDate: '2025-03-21', // 1 فروردین 1404
      endDate: null, // بدون پایان - پیش‌فرض فعلی
      description: 'نرخ پیش‌فرض فعلی از فروردین ۱۴۰۴',
      isActive: true
    }
  ];

  await RateSetting.bulkCreate(rates);
  console.log('✅ نرخ‌ها با موفقیت ریست و جدید ساخته شدند.');
  console.log('📅 نرخ پیش‌فرض: 33,500 تومان از یک فروردین 1404');
  process.exit(0);
}

resetRates(); 