const RateSetting = require('../src/modules/aryafoulad/rateSettings/model');

async function resetRates() {
  await RateSetting.destroy({ where: {} });

  const rates = [
    {
      title: 'نرخ سال ۱۳۹۹ تا ۱۴۰۰',
      ratePerKm: 1800,
      startDate: '2020-03-20', // 1 فروردین 1399
      endDate: '2021-03-20',   // 29 اسفند 1399
      description: 'نرخ پایه برای سال ۱۳۹۹',
      isActive: true
    },
    {
      title: 'نرخ سال ۱۴۰۰ تا ۱۴۰۲',
      ratePerKm: 2500,
      startDate: '2021-03-21', // 1 فروردین 1400
      endDate: '2023-03-20',   // 29 اسفند 1401
      description: 'نرخ میانی برای سال‌های ۱۴۰۰ تا ۱۴۰۲',
      isActive: true
    },
    {
      title: 'نرخ سال ۱۴۰۲ تا الان',
      ratePerKm: 4000,
      startDate: '2023-03-21', // 1 فروردین 1402
      endDate: null, // فقط این یکی بدون پایان
      description: 'نرخ فعلی برای سال‌های ۱۴۰۲ تا الان',
      isActive: true
    }
  ];

  await RateSetting.bulkCreate(rates);
  console.log('✅ نرخ‌ها با موفقیت ریست و جدید ساخته شدند.');
  process.exit(0);
}

resetRates(); 