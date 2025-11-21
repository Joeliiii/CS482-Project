require('dotenv').config();

const dbcon = require('./model/DBConnection');
//const ExpressApp = require('./App');
const app = require('./App');



//for routes --> contact
//const contactRoutes = require('./routes/contact');
//app.use('/api/contact', contactRoutes);

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOSTNAME || 'localhost';

const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket behavior
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message.toString());

        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Choose DB target (real/test) via env; default real unless NODE_ENV=test
const DB_TARGET = process.env.DB_TARGET || (process.env.NODE_ENV === 'test' ? 'test' : 'real');

(async () => {
    try {
        await dbcon.connect(DB_TARGET); // ensure DB is ready before listening
       // ExpressApp.app.listen(PORT, HOST, () => {
        server.listen(PORT, HOST, () => {
            console.log(`HTTP + WebSocket server running at http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error('Fatal startup error:', err?.message || err);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGINT', async () => { try { await dbcon.disconnect(); } finally { process.exit(0); } });
process.on('SIGTERM', async () => { try { await dbcon.disconnect(); } finally { process.exit(0); } });

module.exports = app;