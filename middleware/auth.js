// middleware/auth.js
exports.ensureLoggedIn = function ensureLoggedIn(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ message: 'Not logged in.' });
};
