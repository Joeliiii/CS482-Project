// App.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const memorystore = require('memorystore')(session);

// --- Controllers ---
const SignupController = require('./controller/SignupController');
const LoginController = require('./controller/LoginController');
const UserController = require('./controller/UserController');
const { ensureLoggedIn } = require('./middleware/auth'); // optional
const app = express();
const RoleController = require('./controller/RoleController');
const { requireRole } = require('./middleware/roles');


// Middleware setup
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'Pineapple - Guava - Orange',
    cookie: { maxAge: 86400000 },
    store: new memorystore({ checkPeriod: 86400000 }),
    resave: false,
    saveUninitialized: true
}));

// --- API Routes ---
app.post('/api/auth/signup', SignupController.signup);
app.post('/api/auth/login', LoginController.login);
app.post('/api/auth/logout', LoginController.logout);
app.get('/api/auth/me', LoginController.me);

// --- Serve React build ---
const reactBuildPath = path.join(__dirname, 'view', 'build');
app.use(express.static(reactBuildPath));

// --- SPA fallback ---
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
});

// Update profile (requires login)
app.put('/api/user/me', ensureLoggedIn, UserController.updateMe);

// Role APIs
app.post('/api/roles/assign', /* requireRole('admin'), */ RoleController.assignRole);
app.post('/api/roles/revoke', /* requireRole('admin'), */ RoleController.revokeRole);
app.get('/api/roles/user/:userId', /* requireRole('admin'), */ RoleController.listUserRoles);

exports.app = app;
