const defineAssociations = require('./associations');

const initEquipmentModule = () => {
    console.log("🔗 Initializing Equipment Module associations...");
    defineAssociations();
    console.log("✅ Equipment Module associations initialized successfully.");
};

module.exports = initEquipmentModule; 