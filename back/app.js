//importation des packages de express

const express = require('express');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');
const rateLimit = require('./middleware/rate-limit');

//connection à mangoDB  avec id et mot de passe
mongoose.connect(`mongodb+srv://${config.dbUser}:${config.dbPass}@${config.dbUrl}/${config.dbName}?retryWrites=true&w=majority`)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();
app.use(express.json());
app.use((req, res, next) => {
    //qui peut accéder à l'API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


//gestion des principaux chemins de l'API sauces,auth,images
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api', rateLimit.bruteForceLimiter);

const userRoutes = require('./routes/user');
app.use('/api/auth', userRoutes);

const sauceRoutes = require('./routes/sauce');
app.use('/api/sauces', sauceRoutes);



module.exports = app;