const Warehouse = require('./model');
const seederData = require('./seederData.json');

async function seedWarehouses() {
    try {
        console.log('🌱 Starting warehouse seeding...');

        // حذف داده‌های قبلی
        await Warehouse.destroy({ where: {}, force: true });
        console.log('✅ Previous warehouse data cleared');

        // ایجاد داده‌های جدید
        const warehouses = await Warehouse.bulkCreate(seederData);
        console.log(`✅ ${warehouses.length} warehouses seeded successfully`);

        return warehouses;
    } catch (error) {
        console.error('❌ Error seeding warehouses:', error);
        throw error;
    }
}

module.exports = seedWarehouses; 