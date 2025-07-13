const Equipment = require('./model');

const equipmentData = [
  {
    name: 'لپ‌تاپ Dell Latitude',
    equipment_code: 'EQ-001',
    type: 'company_asset',
    category: 'کامپیوتر',
    model: 'Latitude 5520',
    serial_number: 'DL123456789',
    manufacturer: 'Dell',
    purchase_date: '2023-01-15',
    purchase_price: 45000000,
    location: 'دفتر مرکزی',
    description: 'لپ‌تاپ اداری برای کارشناسان',
    needs_calibration: false,
    status: 'active'
  },
  {
    name: 'مولتی‌متر دیجیتال',
    equipment_code: 'EQ-002',
    type: 'inspection_equipment',
    category: 'ابزار دقیق',
    model: 'Fluke 117',
    serial_number: 'FL987654321',
    manufacturer: 'Fluke',
    purchase_date: '2023-02-20',
    purchase_price: 8500000,
    location: 'انبار تجهیزات',
    description: 'مولتی‌متر برای اندازه‌گیری ولتاژ و جریان',
    needs_calibration: true,
    calibration_certificate: 'CAL-2023-001',
    calibration_period_years: 1,
    calibration_place: 'موسسه استاندارد',
    last_calibration_date: '2023-03-15',
    next_calibration_date: '2024-03-15',
    status: 'active'
  },
  {
    name: 'دوربین حرارتی',
    equipment_code: 'EQ-003',
    type: 'inspection_equipment',
    category: 'ابزار بازرسی',
    model: 'FLIR E4',
    serial_number: 'FLIR123456',
    manufacturer: 'FLIR',
    purchase_date: '2023-03-10',
    purchase_price: 25000000,
    location: 'انبار تجهیزات',
    description: 'دوربین حرارتی برای بازرسی تجهیزات',
    needs_calibration: true,
    calibration_certificate: 'CAL-2023-002',
    calibration_period_years: 2,
    calibration_place: 'موسسه استاندارد',
    last_calibration_date: '2023-04-01',
    next_calibration_date: '2025-04-01',
    status: 'active'
  },
  {
    name: 'میز کار',
    equipment_code: 'EQ-004',
    type: 'company_asset',
    category: 'مبلمان',
    model: 'Standard Desk',
    manufacturer: 'محلی',
    purchase_date: '2023-01-01',
    purchase_price: 2500000,
    location: 'دفتر مرکزی',
    description: 'میز کار استاندارد',
    needs_calibration: false,
    status: 'active'
  },
  {
    name: 'صندلی اداری',
    equipment_code: 'EQ-005',
    type: 'company_asset',
    category: 'مبلمان',
    model: 'Ergonomic Chair',
    manufacturer: 'محلی',
    purchase_date: '2023-01-01',
    purchase_price: 1800000,
    location: 'دفتر مرکزی',
    description: 'صندلی ارگونومیک',
    needs_calibration: false,
    status: 'active'
  }
];

async function seedEquipment() {
  try {
    console.log('🌱 Seeding Equipment data...');
    
    // Check if data already exists
    const existingCount = await Equipment.count();
    if (existingCount > 0) {
      console.log(`✅ Equipment data already exists (${existingCount} records)`);
      return;
    }

    // Create equipment records
    const createdEquipment = await Equipment.bulkCreate(equipmentData);
    
    console.log(`✅ Equipment seeding completed successfully! Created ${createdEquipment.length} records`);
  } catch (error) {
    console.error('❌ Error seeding Equipment:', error);
    throw error;
  }
}

module.exports = seedEquipment; 