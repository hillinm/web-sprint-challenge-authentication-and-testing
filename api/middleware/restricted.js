const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js')

module.exports = (req, res, next) => {
    const token = req.headers.authorization;

    const secret = secrets.jwtSecret;

    if (token) {
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: 'invalid credentials'})
            } else {
                req.decodedToken = decodedToken;
                next();
            }
        });
    } else {
        res.status(400).json({ message: 'username and password required' })
    }
};
