
const rateLimit = require("express-rate-limit");

// on définit une sécurité pour limitter le nombre d'appel à l'api
// que peut faire une seule personne sur un temps définit
exports.bruteForceLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // plage de 10 minutes
    max: 200, // bloquer après 200 requests
    message:
        "Trop d'appels à l'API depuis cet IP, veuillez réessayer après 10 minutes"
});


// on définit un rateLimit pour la création de compte 
exports.createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // plage de 1h
    max: 5, // bloquer après 5 requests
    message:
        "Trop de comptes crées depuis cet IP, veuillez réessayer après 1 heure"
});

// on définit un rateLimit pour la tentative de connexion à un compte
exports.loginAccountLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // plage de 30 minutes
    max: 5, // bloquer après 5 requests
    message:
        "Trop de tentatives de login depuis cet IP, veuillez réessayer après 30 minutes"
});