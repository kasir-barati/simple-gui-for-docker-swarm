const router = require('express').Router();
const multipartMiddleware = require('connect-multiparty')();

const UserValidator = require('../controllers/validators/user');
const UserController = require('../controllers/middlewares/user');
const Auth = require('../controllers/middlewares/auth');

router.route('/profile')
    .all(Auth.userIsLoggedIn)
    .get(UserController.getProfile)
    .post(UserValidator.postUpdateProfile, UserController.postUpdateProfile);

router.route('/password-reset')
    .all(Auth.userIsLoggedIn)
    .post(UserValidator.postPasswordReset, UserController.postPasswordReset);

router.route('/payments')
    .all(Auth.userIsLoggedIn)
    .get(UserController.getPayments);

router.route('/payments/pay')
    .all(Auth.userIsLoggedIn)
    .post(UserValidator.postPayment, UserController.postPayment);

router.route('/payments/verification/:id')
    .all(Auth.userIsLoggedIn)
    .get(UserValidator.getPaymentVerification, UserController.getPaymentVerification);

router.route('/tickets')
    .all(Auth.userIsLoggedIn)
    .get(UserController.getTickets);

router.route('/tickets/create')
    .all(Auth.userIsLoggedIn)
    .post(multipartMiddleware, UserValidator.postTicket, UserController.postTicket);

router.route('/tickets/:id')
    .all(Auth.userIsLoggedIn)
    .get(UserValidator.checkTicketId, UserController.getTicket)
    .delete(UserValidator.checkTicketId, UserController.deleteTicket);

router.route('/tickets/:id/message')
    .all(Auth.userIsLoggedIn)
    .post(multipartMiddleware, UserValidator.postTicketMessage, UserController.postTicketMessage);

module.exports = router;