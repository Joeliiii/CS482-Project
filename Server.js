require('dotenv').config();

const dbcon = require('./model/DBConnection');
const ExpressApp = require('./App');

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOSTNAME || 'localhost';

// Choose DB target (real/test) via env; default real unless NODE_ENV=test
const DB_TARGET = process.env.DB_TARGET || (process.env.NODE_ENV === 'test' ? 'test' : 'real');

(async () => {
    try {
        await dbcon.connect(DB_TARGET); // ensure DB is ready before listening
        ExpressApp.app.listen(PORT, HOST, () => {
            console.log(`Server Running on ${HOST}:${PORT}...`);
        });
    } catch (err) {
        console.error('Fatal startup error:', err?.message || err);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGINT', async () => { try { await dbcon.disconnect(); } finally { process.exit(0); } });
process.on('SIGTERM', async () => { try { await dbcon.disconnect(); } finally { process.exit(0); } });
