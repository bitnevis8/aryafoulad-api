const AccountingSettings = require('./model/AccountingSettings');
const seedData = require('./seederData.json');
const Service = require('./model/Service');
const BankAccount = require('./model/BankAccount');
const User = require('../user/user/model');

async function seedAccounting() {
  try {
    const existing = await AccountingSettings.findOne();
    if (existing) {
      await existing.update(seedData);
    } else {
      await AccountingSettings.create(seedData);
    }
    console.log('✅ Accounting settings seeded successfully');

    // Seed services if present
    if (Array.isArray(seedData.services) && seedData.services.length) {
      for (const s of seedData.services) {
        let responsible_user_id = null;
        
        // Convert responsible_name to responsible_user_id
        if (s.responsible_name) {
          const nameParts = s.responsible_name.trim().split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts[1];
            const user = await User.findOne({
              where: {
                firstName: firstName,
                lastName: lastName
              }
            });
            
            if (user) {
              responsible_user_id = user.id;
            }
          }
        }
        
        // Remove fields that don't exist in the model and add responsible_user_id
        const { responsible_name, ...serviceData } = s;
        serviceData.responsible_user_id = responsible_user_id;
        
        const [service, created] = await Service.findOrCreate({ where: { code: s.code }, defaults: serviceData });
        if (!created && responsible_user_id) {
          // Update existing service with responsible_user_id
          await service.update({ responsible_user_id });
        }
      }
      console.log('✅ Accounting services seeded successfully');
    }
    // Seed bank accounts if present
    if (Array.isArray(seedData.bank_accounts) && seedData.bank_accounts.length) {
      for (const b of seedData.bank_accounts) {
        await BankAccount.findOrCreate({ where: { account_number: b.account_number }, defaults: b });
      }
      console.log('✅ Accounting bank accounts seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding accounting settings:', error);
    throw error;
  }
}

module.exports = seedAccounting;


