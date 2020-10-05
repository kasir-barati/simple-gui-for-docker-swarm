/**
 * require core modules
 */
const path = require('path');

/**
 * require third party packages
 */
const express = require("express");
const session = require('express-session');
const connectFlash = require('connect-flash');
const SequelizeStore = require("connect-session-sequelize")(session.Store);

/**
 * require my modules
 */
const sequelize = require('./models/index');
const { port, host, coockieSecret, baseUrl } = require("./config");

/**
 * Routing files
 */
const userRoutes = require('./routes/user');
const planRoutes = require('./routes/plan');
const adminRoutes = require('./routes/admin');
const indexRoutes = require('./routes/index');
const imageRoutes = require('./routes/image');
const staticProjectRoutes = require('./routes/static-project');
const preparedProjectRoutes = require('./routes/prepared-project');
const { errorOccurred, pageNotFound } = require('./controllers/middlewares/error');

/**
 * Initializing
 */
const app = express();
const sessionStore = new SequelizeStore({
    db: sequelize.sequelize,
    tableName: 'userSessions',
    expiration: 12 * 3600000,
    checkExpirationInterval: 3600000
});

/**
 * setup express app
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * middlewares
 */
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
    secret: coockieSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));
app.use(connectFlash());
app.use(indexRoutes);
app.use('/user/', userRoutes);
app.use('/admin/plans', planRoutes);
app.use('/admin/images', imageRoutes);
app.use('/admin', adminRoutes);
app.use('/projects/static-projects', staticProjectRoutes);
app.use('/projects/prepared-projects', preparedProjectRoutes);
app.use(pageNotFound);
app.use(errorOccurred);

sequelize.sync().then(() => {
    app.listen(port, () => console.log(`server is started at ${new Date()} on ${baseUrl}`));
    require('./jobs');
}).catch(error => { throw error });

module.exports = app;