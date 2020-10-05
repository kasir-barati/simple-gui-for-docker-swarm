const router = require('express').Router();
const multipartMiddleware = require('connect-multiparty')();

const ImageValidator = require('../controllers/validators/image');
const ImageController = require('../controllers/middlewares/image');
const Auth = require('../controllers/middlewares/auth');

router.route('/')
    .all(Auth.isAdmin)
    .get(ImageController.getImages);

router.route('/create')
    .all(Auth.isAdmin)
    .post(multipartMiddleware, ImageValidator.postCreateImage, ImageController.postCreateImage);

router.route('/edit/:id')
    .all(Auth.isAdmin)
    .get(ImageValidator.getEditImage, ImageController.getEditImage)
    .post(multipartMiddleware, ImageValidator.postEditImage, ImageController.postEditImage);

router.route('/delete/:id')
    .all(Auth.isAdmin)
    .post(ImageValidator.postDeleteImage, ImageController.postDeleteImage);

module.exports = router;