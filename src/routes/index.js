const router = require('express').Router();

const Auth = require('../controllers/middlewares/auth');
const IndexValidator = require('../controllers/validators/index');
const IndexController = require('../controllers/middlewares/index');

router.route('/login')
    .all(Auth.userIsLoggedIn)
    .get(IndexController.getLogin)
    .post(IndexValidator.postLogin, IndexController.postLogin);

router.route('/logout')
    .all(Auth.userIsLoggedIn)
    .get(IndexController.getLogout);

router.route('/register')
    .all(Auth.userIsLoggedIn)
    .get(IndexController.getRegister)
    .post(IndexValidator.postRegister, IndexController.postRegister);

router.route('/email-verification')
    .all(Auth.userIsLoggedIn)
    .post(IndexValidator.postEmailVerification, IndexController.postEmailVerification)

router.route('/email-verification/:token')
    .all(Auth.userIsLoggedIn)
    .get(IndexValidator.getEmailVerificationToken, IndexController.getEmailVerificationToken);

router.route('/password-reset')
    .all(Auth.userIsLoggedIn)
    .post(IndexValidator.postPasswordReset, IndexController.postPasswordReset);

// router.route('/connect-to-github')
//     .all(Auth.userIsLoggedIn)
//     .get(passport.authenticate('github'));

// router.route('/connect-to-github/callback')
//     .all(passport.authenticate('github', { failureRedirect: '/login' }))
//     .get(IndexController.getConnectedToGithub);

module.exports = router;