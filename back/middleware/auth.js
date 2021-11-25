const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, config.random_token_secret);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else if (req.body.sauce) {
            const sauceObj = JSON.parse(req.body.sauce);
            if (sauceObj.userId && sauceObj.userId != userId) {
                throw 'Invalid user ID';
            } else {
                next();
            }
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};