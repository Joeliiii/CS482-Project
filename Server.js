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
const rooms = new Map();   // Map<slug, Set<WebSocket>>

wss.on('connection', (ws, req) => {
    //Expect URL like: /chat/slug-name
    const path = req.url || "";
    const parts = path.split("/");

    //Last part of path is slug
    const slug = parts.pop() || "default";

    console.log(`Client connected to room: ${slug}`);

    //Create room if not exists
    if (!rooms.has(slug)) rooms.set(slug, new Set());
    rooms.get(slug).add(ws);

    ws.on('message', (raw) => {
        let message;
        try {
            message = JSON.parse(raw.toString());
        } catch {
            console.log("Invalid JSON from client");
            return;
        }

        console.log(`Message in room ${slug}:`, message.message);

        //Broadcast only to this room
        for (const client of rooms.get(slug)) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    slug,
                    message: message.message,
                }));
            }
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected from room: ${slug}`);
        rooms.get(slug).delete(ws);
        if (rooms.get(slug).size === 0) rooms.delete(slug); // clean empty rooms
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