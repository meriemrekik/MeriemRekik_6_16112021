
const express = require('express');
const router = express.Router();

// on importe des middleware du package express validator et rate limit
const { body, check, validationResult } = require('express-validator');
const rateLimit = require('../middleware/rate-limit');

// on import le controller user
const userCtrl = require('../controllers/user');

router.post('/signup',
    rateLimit.createAccountLimiter,
    body('email').isEmail(),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir 8 caractère minimum.')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'g')
        .withMessage('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre'),
    (req, res, next) => {
        var err = validationResult(req);
        if (!err.isEmpty()) {
            res.status(400).json({
                error: err.mapped().password.msg
            });
            // you stop here 
        } else {
            // you pass req and res on to your controller
            next();
        }
    },
    userCtrl.signup
);
router.post('/login', rateLimit.loginAccountLimiter, body('email').isEmail(), userCtrl.login);

module.exports = router;//export du router