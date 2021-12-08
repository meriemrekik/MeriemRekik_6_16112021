const Sauce = require('../models/sauce');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
    // On récupère les infos envoyés depuis un formulaire
    // le json de la sauce est mis dans une chaine de caractère
    // on parse le json
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    // on crée la sauce en base de données
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Sauce crée avec succes !'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}

exports.getAllSauce = (req, res, next) => {
    // on récupère toute les sauces disponible
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}

exports.getOneSauce = (req, res, next) => {
    // on récupère la première sauce que l'on trouve 
    // qui a _id égale à l'id que l'on a mit en param de notre route
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    let sauceObject = null;
    // si on a recu un nouveau fichier image alors on recoit la requete en multiform/data
    // le json des infos de la sauce est mis dans une chaine de caractère dans le body 
    if (req.file) {
        let sauceParsed = JSON.parse(req.body.sauce);
        sauceObject = {
            name: sauceParsed.name,
            manufacturer: sauceParsed.manufacturer,
            description: sauceParsed.description,
            mainPepper: sauceParsed.mainPepper,
            heat: sauceParsed.heat,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
        // sinon on a recu la requete dans le body au format json normal
    } else {
        sauceObject = {
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat,
        };
    }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

const iLikeSauce = (sauceUpdates, userId) => {
    // et si il n'a pas déjà aimé cette sauce
    if (!sauceUpdates.usersLiked.includes(userId)) {
        // on le rajoute dans la liste des user qui likes
        sauceUpdates.usersLiked.push(userId);
    }
    // et si il était aussi de ceux qui aiment pas
    if (sauceUpdates.usersDisliked.includes(userId)) {
        // on le retire de la liste des gens qui n'aiment pas
        sauceUpdates.usersDisliked = sauceUpdates.usersDisliked.filter(userid => userid != userId);
    }
    return sauceUpdates;
}

const iDislikeSauce = (sauceUpdates, userId) => {
    // si il a déjà aimé cette sauce
    if (sauceUpdates.usersLiked.includes(userId)) {
        // on le retire de la liste des user qui likes
        sauceUpdates.usersLiked = sauceUpdates.usersLiked.filter(userid => userid != userId);
    }
    // et si il n'était n'était de ceux qui aiment pas
    if (!sauceUpdates.usersDisliked.includes(userId)) {
        // on le rajoute de la liste des gens qui n'aiment pas
        sauceUpdates.usersDisliked.push(userId);
    }
    return sauceUpdates;
}

const iCancelLikeSauce = (sauceUpdates, userId) => {
    // si il a déjà aimé cette sauce
    if (sauceUpdates.usersLiked.includes(userId)) {
        // on le retire de la liste des user qui likes
        sauceUpdates.usersLiked = sauceUpdates.usersLiked.filter(userid => userid != userId);
    }
    // Si il était de ceux qui aiment pas
    if (sauceUpdates.usersDisliked.includes(userId)) {
        // on le retire de la liste des gens qui n'aiment pas
        sauceUpdates.usersDisliked = sauceUpdates.usersDisliked.filter(userid => userid != userId);
    }
    return sauceUpdates;
}

exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            const sauceObject = sauce.toObject();
            let sauceUpdates = {
                likes: sauceObject.likes,
                dislikes: sauceObject.dislikes,
                usersLiked: sauceObject.usersLiked,
                usersDisliked: sauceObject.usersDisliked,
            }
            // Si l'utilisateur vient d'aimer la sauce
            if (req.body.like == 1) {
                sauceUpdates = iLikeSauce(sauceUpdates, userId);
                // sinon si l'utilisateur veut annuler son like
            } else if (req.body.like == 0) {
                sauceUpdates = iCancelLikeSauce(sauceUpdates, userId);
            } else if (req.body.like == -1) {
                sauceUpdates = iDislikeSauce(sauceUpdates, userId);
            }
            sauceUpdates.likes = sauceUpdates.usersLiked.length;
            sauceUpdates.dislikes = sauceUpdates.usersDisliked.length;
            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, ...sauceUpdates, _id: req.params.id }).then(() => {
                res.status(200).json({ message: 'Objet modifié !' });
            }).catch((error) => {
                res.status(200).json({ message: 'Erreur pendant la sauvegarde des suppressions !' });
            })
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};