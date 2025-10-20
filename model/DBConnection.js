require('dotenv').config();
const mongoose = require('mongoose');

function pickDbName(where) {
    if (where === 'test') return process.env.DB_NAME_TEST || 'TestInfo';
    return process.env.DB_NAME_REAL || 'RealDatabase';
}

exports.connect = async function (where) {
    const host = process.env.DB_HOST;                 // e.g., cs482project.ljegk8u.mongodb.net
    const user = process.env.DB_USER;                 // Atlas DB username
    const rawPass = process.env.DB_PASS || '';        // RAW password from .env
    const pass = encodeURIComponent(rawPass);         // encode special chars
    const db = pickDbName(where);

    if (!host || !user || !rawPass) {
        throw new Error('Missing DB env vars. Need DB_HOST, DB_USER, DB_PASS. Optionally DB_NAME_REAL/TEST.');
    }

    const appName = encodeURIComponent(process.env.APP_NAME || 'CS482Project');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME_REAL:', process.env.DB_NAME_REAL);
    console.log('DB_NAME_TEST:', process.env.DB_NAME_TEST);
    console.log('DB_PASS length:', (process.env.DB_PASS || '').length);
// ⚠️ DO NOT print the actual password

    const uri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority&appName=${appName}`;

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10
        });
        console.log(`✅ MongoDB connected → ${host}/${db}`);
    } catch (e) {
        console.error('❌ MongoDB connect failed:', e.message);
        throw e;
    }

    // runtime observers (optional but useful)
    mongoose.connection.on('error', (e) => console.error('Mongo error:', e));
    mongoose.connection.on('disconnected', () => console.warn('⚠️ Mongo disconnected'));
};

exports.disconnect = async function () {
    await mongoose.connection.close();
    console.log('🛑 MongoDB disconnected');
};
