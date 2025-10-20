// model/scripts/seedRoles.js
require('dotenv').config();
const db = require('../DBConnection');
const Role = require('../Role');

(async () => {
    try {
        const target = process.env.DB_TARGET || 'real';
        await db.connect(target);

        const base = [
            { name: 'admin',   displayName: 'Admin' },
            { name: 'manager', displayName: 'Team Manager' },
            { name: 'user',    displayName: 'User' }
        ];

        for (const r of base) {
            await Role.updateOne({ name: r.name }, { $setOnInsert: r }, { upsert: true });
        }

        const all = await Role.find().lean();
        console.log('✅ Roles ready:', all.map(r => `${r.name}(${r._id})`).join(', '));

        await db.disconnect();
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed roles failed:', e);
        process.exit(1);
    }
})();
