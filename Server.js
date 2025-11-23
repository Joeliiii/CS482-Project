require('dotenv').config();

const dbcon = require('./model/DBConnection');
// const app = require('./App');
const { app, sessionMiddleware } = require('./App');



//for routes --> contact
//const contactRoutes = require('./routes/contact');
//app.use('/api/contact', contactRoutes);

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOSTNAME || 'localhost';

const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });


// WebSocket behavior
const rooms = new Map();   // Map<slug, Set<WebSocket>>

server.on('upgrade', (req, socket, head) => {
    sessionMiddleware(req, {}, () => {
        if (!req.session.userId) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    });
});

wss.on('connection', (ws, req) => {
    const user = {
        id: req.session.userId,
        username: req.session.username || 'Unknown',
        isAdmin: req.session.isAdmin || false
    };

    const parts = req.url.split('/');
    const slug = parts.pop() || 'default';

    console.log(`User ${user.username} connected to room: ${slug}`);

    if (!rooms.has(slug)) rooms.set(slug, new Set());
    rooms.get(slug).add(ws);

    ws.on('message', raw => {
        let data;

        try {
            data = JSON.parse(raw.toString());
        } catch {
            ws.send(JSON.stringify({ error: "Invalid JSON format" }));
            return;
        }

        if (!data.message || typeof data.message !== 'string') {
            ws.send(JSON.stringify({ error: "Message must be a string" }));
            return;
        }

        for (const client of rooms.get(slug)) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        slug,
                        user: user.username,
                        message: data.message
                    })
                );
            }
        }
    });

    ws.on('close', () => {
        rooms.get(slug)?.delete(ws);
        if (rooms.get(slug)?.size === 0) rooms.delete(slug);
        console.log(`User ${user.username} disconnected from room: ${slug}`);
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