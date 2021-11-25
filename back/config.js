require('dotenv').config();

module.exports = {
    dbPass: process.env.DB_PASSWORD,
    dbUrl: process.env.DB_URL,
    dbUser: process.env.DB_USER,
    dbName: process.env.DB_NAME,
    random_token_secret: process.env.RANDOM_TOKEN_SECRET,
}
