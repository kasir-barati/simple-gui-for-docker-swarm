const router = require('express').Router();

const AdminValidator = require('../controllers/validators/admin');
const AdminController = require('../controllers/middlewares/admin');
const Auth = require('../controllers/middlewares/auth');

router.route('/admins')
    .all(Auth.isAdmin)
    .get(AdminController.getAdmins);

router.route('/admins/create')
    .all(Auth.isAdmin)
    .post(AdminValidator.postCreateAdmin, AdminController.postCreateAdmin);

router.route('/users/delete/:id')
    .all(Auth.isAdmin)
    .post(AdminValidator.checkUserId, AdminController.postDeleteUser);

router.route('/user-payments')
    .all(Auth.isAdmin)
    .get(AdminController.getUserPayments);

module.exports = router;