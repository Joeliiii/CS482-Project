// App.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');

// --- Controllers ---
const SignupController = require('./controller/SignupController');
const LoginController = require('./controller/LoginController');
const UserController = require('./controller/UserController');
const RoleController = require('./controller/RoleController');
const ChildrenController = require('./controller/ChildrenController');
const AdminController = require('./controller/AdminController');
const MatchController = require('./controller/MatchController');
const BracketController = require('./controller/BracketController');
let Event; try { Event = require('./model/Event'); } catch (_) {}
const publicEvents = require('./routes/publicEvents');
const publicMatches = require('./routes/publicMatches');

// --- Middleware ---
const { ensureLoggedIn } = require('./middleware/auth');
const { requireRole } = require('./middleware/roles');

const app = express();

// --- Core middleware ---
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// If your FE runs on a different origin in dev, keep credentials + explicit origins.
// If FE is served by the same origin, you can simplify to app.use(cors()).
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    cookie: { maxAge: 86400000 },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

// ---------------------------
// API ROUTES (must be BEFORE SPA fallback)
// ---------------------------
app.use('/api/events', publicEvents);
app.use('/api/matches', publicMatches);
// Auth
app.post('/api/auth/signup', SignupController.signup);
app.post('/api/auth/login',  LoginController.login);
app.post('/api/auth/logout', LoginController.logout);
app.get('/api/auth/me',      LoginController.me);

// Me / Profile
app.put('/api/user/me', ensureLoggedIn, UserController.updateMe);

// Children for the logged-in adult
app.get('/api/me/children',              ensureLoggedIn, ChildrenController.listMine);
app.post('/api/me/children',             ensureLoggedIn, ChildrenController.createMine);
app.delete('/api/me/children/:childId',  ensureLoggedIn, ChildrenController.deleteMine);

// Roles (you can re-enable admin guard when ready)
app.post('/api/roles/assign', RoleController.assignRole);
app.post('/api/roles/revoke', RoleController.revokeRole);
app.get('/api/roles/user/:userId', RoleController.listUserRoles);

// Contact + Teams
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

const teamRoutes = require('./routes/team');
app.use('/api/teams', teamRoutes);

// Schedule routes
const scheduleRoutes = require('./routes/schedule');
app.use('/api/schedule', scheduleRoutes);

//supportMessages Routes
const supportMessageRoutes = require('./routes/supportMessage');
app.use('/api/support', supportMessageRoutes);

// --- Admin (protect with admin role) ---
app.get('/api/admin/users', requireRole('admin'), AdminController.listUsers);
app.put('/api/admin/users/:userId', requireRole('admin'), AdminController.updateUser);
app.put('/api/admin/users/:userId/roles', requireRole('admin'), AdminController.updateUserRoles);
app.get('/api/admin/children/:userId', requireRole('admin'), AdminController.listChildren);
app.get('/api/admin/overview', requireRole('admin'), AdminController.overview);

// Per-user roles helpers
app.get('/api/admin/users/:userId/roles', requireRole('admin'), AdminController.listUserRoles);
app.post('/api/admin/roles/assign', requireRole('admin'), AdminController.assignRole);
app.post('/api/admin/roles/revoke', requireRole('admin'), AdminController.revokeRole);

// Teams
app.get('/api/admin/teams', requireRole('admin'), AdminController.listTeams);
app.post('/api/admin/teams', requireRole('admin'), AdminController.createTeam);
app.put('/api/admin/teams/:teamId', requireRole('admin'), AdminController.updateTeam);
app.delete('/api/admin/teams/:teamId', requireRole('admin'), AdminController.deleteTeam);
app.delete('/api/admin/users/:userId', requireRole('admin'), AdminController.deleteUser);
app.put('/api/admin/children/:childId/team', requireRole('admin'), AdminController.assignChildToTeam);


// Events
app.get('/api/admin/events', requireRole('admin'), AdminController.listEvents);
app.post('/api/admin/events', requireRole('admin'), AdminController.createEvent);
app.put('/api/admin/events/:eventId', requireRole('admin'), AdminController.updateEvent);
app.delete('/api/admin/events/:eventId', requireRole('admin'), AdminController.deleteEvent);


// Brackets
app.get('/api/bracket/event/:eventId', BracketController.byEvent);

if (Event) {
    app.get('/api/events', async (req, res) => {
        try {
            const items = await Event.find({}).sort({ start: 1 }).lean();
            res.json(items);
        } catch (e) {
            console.error('events list error:', e);
            res.status(500).json({ message: 'Server error.' });
        }
    });
}

//Matches
// Admin: matches
app.get('/api/admin/matches', requireRole('admin'), MatchController.list);
app.post('/api/admin/matches', requireRole('admin'), MatchController.create);
app.put('/api/admin/matches/:matchId', requireRole('admin'), MatchController.update);
app.delete('/api/admin/matches/:matchId', requireRole('admin'), MatchController.remove);

// ---------------------------
// Static + SPA fallback
// ---------------------------
const reactBuildPath = path.join(__dirname, 'view', 'build');
app.use(express.static(reactBuildPath));

// SPA fallback: only for non-API GETs
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
});

//module.exports = app;
module.exports = { app, sessionMiddleware };
