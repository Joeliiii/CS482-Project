require('dotenv').config();
const { connect } = require('../DBConnection');
const models = require('../models');

(async () => {
    try {
        // choose which db (real/test); you can pass 'test' to use TestInfo
        await connect(process.env.DB_TARGET || 'real');

        // Ensure indexes for every model (this will also create collections)
        await Promise.all(
            Object.values(models).map((m) => m.createIndexes())
        );

        console.log('✅ Collections & indexes ensured');
    } catch (e) {
        console.error('❌ Init error:', e);
    } finally {
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        process.exit(0);
    }
})();
