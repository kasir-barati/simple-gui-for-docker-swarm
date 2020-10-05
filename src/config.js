const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    port: process.env.PORT,
    host: process.env.HOST,
    dockerApiHostname: process.env.DOCKER_API_HOSTNAME,
    dockerApiPort: process.env.DOCKER_API_PORT,
    dockerUser: process.env.DOCKER_USER,
    dockerPassword: process.env.DOCKER_PASSWORD,
    dbHost: process.env.PGHOST,
    dbPort: process.env.PGPORT,
    dbName: process.env.PGDATABASE, 
    dbUser: process.env.PGUSER, 
    dbPassword: process.env.PGPASSWORD,
    gmailUsername: process.env.GMAIL_USERNAME,
    gmailPassword: process.env.GMAIL_PASSWORD,
    cloudflareUser: process.env.CLOUDFLARE_USERNAME,
    cloudflareToken: process.env.CLOUDFLARE_TOKEN,
    bcryptjsSalt: process.env.BCRYPTJS_SALT,
    coockieSecret: process.env.COOCKIE_SECRET,
    baseUrl: `http://${process.env.HOST}:${process.env.PORT}`
};