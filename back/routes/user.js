
const express = require('express');
const router = express.Router();

// on importe des middleware du package express validator et rate limit
const { body, check, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");

// on définit un rateLimit pour la création de compte
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // plage de 1h
    max: 5, // bloquer après 5 requests
    message:
        "Trop de comptes crées depuis cet IP, veuillez réessayer après 1 heure"
});

// on définit un rateLimit pour la tentative de connexion à un compte
const loginAccountLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // plage de 30 minutes
    max: 5, // bloquer après 5 requests
    message:
        "Trop de tentatives de login depuis cet IP, veuillez réessayer après 30 minutes"
});

// on import le controller user
const userCtrl = require('../controllers/user');

router.post('/signup',
    createAccountLimiter,
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
router.post('/login', loginAccountLimiter, body('email').isEmail(), userCtrl.login);

module.exports = router;//export du router