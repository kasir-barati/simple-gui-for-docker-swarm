const ImageService = require('../../services/image');
const PlanService = require('../../services/plan');

class ImageController {
    static async getImages (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const { images } = await ImageService.readImages();
            const { email, balance, fullname } = req.session.user;
            const errorMessages = req.flash('errorMessages');

            res.render('admin/images', {
                email,
                images,
                isAdmin,
                balance,
                messages,
                fullname,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - Read Images',
            });
        } catch (error) { next(error) };
    };

    static async postCreateImage (req, res, next) {
        try {
            const { name, type, versions, planName } = req.body;
            const { file } = req.files;

            // if the checkbox is checked, I get req.body.available -> 'on', if isn't checked, I get req.body.available -> undefined
            await ImageService.createImage(name, type, versions, planName, file);

            req.flash('messages', 'ایمیجت ساخته رفت');
            res.redirect('/admin/images');
        } catch (error) { next(error) };
    };

    static async getEditImage (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const { image } = await ImageService.getImage(id);
            const { plan } = await PlanService.getPlan(image.planId);
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            
            res.render('admin/edit-image', {
                image,
                email,
                isAdmin,
                balance,
                fullname,
                messages,
                projectId: '',
                errorMessages,
                planName: plan ? plan.name : '',
                pageTitle: 'Ariana-Cloud - edit image',
            });
        } catch (error) { next(error) };
    };

    static async postEditImage (req, res, next) {
        try {
            const { name, type, versions, planName } = req.body;
            const { file } = req.files;
            const { id } = req.params;
            
            await ImageService.updateImage(id, name, type, versions, planName, file);

            req.flash('messages', ['ایمیج ویرایش شد']);
            res.redirect('/admin/images');
        } catch (error) { next(error) };
    };

    static async postDeleteImage (req, res, next) {
        try {
            const { id } = req.params;

            await ImageService.deleteImage(id);
            
            req.flash('messages', ['ایمیج حذف شد']);
            res.redirect('/admin/images');
        } catch (error) { next(error) };
    };
};

module.exports = ImageController;