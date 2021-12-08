const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Fonction pour s'enregistrer comme utilisateur
exports.signup = (req, res, next) => {
    // on hash le password qui est dans le body
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            // On crée un document user avec l'email et son password haché
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // on sauvegarde en base l'utilisateur
            user.save().then(() => res.status(201).json({ message: 'Utilisateur créé !' })).catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
};

// fonction pour authentifier un utilisateur qui veut se connecter
exports.login = (req, res, next) => {
    // on recherche l'utilisateur par son email
    User.findOne({ email: req.body.email })
        .then(user => {
            // si aucun utilisateur n'a cet email alors on retourne une erreur
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // on compare le mot de passe saisit par l'utilisateur avec le mot de passe hashé de l'utilisateur en base
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // si les mot de passe son différent on retourne une erreure
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    // sinon on retourne dans notre réponse un token pour l'utilisateur qui expire dans 24h
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            config.random_token_secret,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};