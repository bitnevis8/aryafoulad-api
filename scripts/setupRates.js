const RateSetting = require('../src/modules/aryafoulad/rateSettings/model');

async function setupRates() {
  // ابتدا تمام نرخ‌های موجود را پاک می‌کنیم
  await RateSetting.destroy({ where: {} });
  console.log('🗑️ تمام نرخ‌های قبلی پاک شدند.');

  const allRates = [
    // نرخ پیش‌فرض اصلی
    {
      title: 'نرخ پیش‌فرض ۱۴۰۴',
      ratePerKm: 33500,
      startDate: '2025-03-21', // 1 فروردین 1404
      endDate: null, // بدون پایان - پیش‌فرض فعلی
      description: 'نرخ پیش‌فرض فعلی از فروردین ۱۴۰۴',
      isActive: true
    },
    // نرخ‌های نمونه
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
    },
    {
      title: 'نرخ ماموریت‌های خارج از شهر',
      ratePerKm: 42000,
      startDate: '2025-03-21', // 1 فروردین 1404
      endDate: '2025-12-29',   // 8 دی 1404
      description: 'نرخ ویژه برای ماموریت‌های خارج از محدوده شهری',
      isActive: false
    }
  ];

  await RateSetting.bulkCreate(allRates);
  
  console.log('✅ تمام نرخ‌ها با موفقیت تنظیم شدند.');
  console.log('\n📋 خلاصه نرخ‌های تنظیم شده:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  allRates.forEach((rate, index) => {
    const status = rate.isActive ? '🟢 فعال' : '⚪ غیرفعال';
    const endDate = rate.endDate ? rate.endDate : 'بدون پایان';
    console.log(`${index + 1}. ${rate.title}`);
    console.log(`   💰 نرخ: ${rate.ratePerKm.toLocaleString()} تومان/کیلومتر`);
    console.log(`   📅 بازه: ${rate.startDate} تا ${endDate}`);
    console.log(`   📝 توضیح: ${rate.description}`);
    console.log(`   🔘 وضعیت: ${status}`);
    console.log('');
  });
  
  console.log('🎯 نکات مهم:');
  console.log('   • نرخ پیش‌فرض 33,500 تومان فعال است');
  console.log('   • سایر نرخ‌ها غیرفعال هستند و می‌توانید در صورت نیاز فعال کنید');
  console.log('   • تمام نرخ‌ها از یک فروردین 1404 شروع می‌شوند');
  
  process.exit(0);
}

setupRates(); 