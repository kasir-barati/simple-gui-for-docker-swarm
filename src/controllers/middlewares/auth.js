const UserModel = require('../../models/user');

class Auth {
    static async userIsLoggedIn (req, res, next) {
        try {
            if (req.originalUrl.match(/(register)|(login)|(email-verification)|(password-reset)|(login-register)/)) {
                if (req.session.isLoggedIn) {
                    req.session.user.balance = (await UserModel.findByPk(req.session.user.id)).balance;
                    res.redirect('/projects/prepared-projects');
                } else {
                    next();
                };
            } else {
                if (req.session.isLoggedIn) {
                    req.session.user.balance = (await UserModel.findByPk(req.session.user.id)).balance;
                    next();
                } else {
                    res.redirect('/login');
                };
            };
        } catch (error) { next(error) };
    };

    static async isAdmin (req, res, next) {
        try {
            if (req.session.isAdmin) {
                next();
            } else {
                res.redirect('/login');
            };
        } catch (error) { next(error) };
    };
};

module.exports = Auth;