// App.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const memorystore = require('memorystore')(session);

// --- Controllers ---
const SignupController = require('./controller/SignupController');

const app = express();

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

// --- Serve React build ---
const reactBuildPath = path.join(__dirname, 'view', 'build');
app.use(express.static(reactBuildPath));

// --- SPA fallback ---
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
});

exports.app = app;
