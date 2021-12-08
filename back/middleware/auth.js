const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    try {
        // on récupère le token dans le header de la requete
        const token = req.headers.authorization.split(' ')[1];
        // on décode le token
        const decodedToken = jwt.verify(token, config.random_token_secret);
        const userId = decodedToken.userId;
        // si dans le body de notre requete on trouve un userId
        // et que celui ci ne correspond pas à la valeur du token on mes une erreur
        if (req.body.userId) {
            if (req.body.userId !== userId) {
                throw 'Invalid user ID';
            } else {
                next();
            }
        } else if (req.body.sauce) {
            const sauceObj = JSON.parse(req.body.sauce);
            // si on a un userId dans notre sauce et si il corrspond à celui du token on mes next
            if (sauceObj.userId && sauceObj.userId == userId) {
                next();
            } else {
                throw 'Invalid user ID';
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