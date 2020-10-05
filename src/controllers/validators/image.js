const Validator = require('../../utils/validator');

const ImageModel = require('../../models/image');
const PlanModel = require('../../models/plan');

class ImageValidator {
    static async postCreateImage (req, res, next) {
        try {
            const { name, type, planName } = req.body;
            const { file } = req.files;
            const errorMessages = [];

            await ImageModel.findOne({ where: { name }}) ? errorMessages.push('اسم پلنتو عوض کن. این اسم قبلا انتخاب شده') : '';
            !type.match(/(static)|(prepared)|(project)|(database)/) ? errorMessages.push('نوع ایمیجو درست انتخاب نکردی') : '';
            !await PlanModel.findOne({ where: { name: planName }}) ? errorMessages.push('همچین پلنی نداریم') : '';
            if (file.name) {
                (file.size > 3 * 1024 * 1024) ? errorMessages.push('فایلایی که آپلود میکنی بیشتر از ۳ مگا بایت نباید باشن.') : '';
                !Validator.isPng(file.type) ? errorMessages.push('فرمت عکس باس png باشه.') : '';
            } else if (file.length > 0) {
                errorMessages.push('فقط یه عکس میتونی آپلود کنی');
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/images');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async getEditImage (req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];

            !await ImageModel.findByPk(id) ? errorMessages.push('پلنی با این آی دی نداریم دایه!') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/images');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postEditImage (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.params;
            const { file } = req.files;
            const { name, type, planName } = req.body;
            const image = await ImageModel.findByPk(id);
            
            if (image.name !== name) {
                await ImageModel.findOne({ where: { name }}) ? errorMessages.push('این اسمی که روی ایمیجت گذاشتی قبلا انتخاب شده') : '';
            };
            !type.match(/(prepared)|(project)|(database)/) ? errorMessages.push('نوع ایمیجو درست انتخاب نکردی') : '';
            !await PlanModel.findOne({ where: { name: planName }}) ? errorMessages.push('همچین پلنی نداریم') : '';
            if (file.name) {
                (file.size > 3 * 1024 * 1024) ? errorMessages.push('فایلایی که آپلود میکنی بیشتر از ۳ مگا بایت نباید باشن.') : '';
                !Validator.isPng(file.type) ? errorMessages.push('فرمت عکس باس png باشه.') : '';
            } else if (file.length > 0) {
                errorMessages.push('فقط یه عکس میتونی آپلود کنی');
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/admin/images/edit/${id}`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postDeleteImage (req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];

            !await ImageModel.findByPk(id) ? errorMessages.push('پلنی با این آی دی نداریم دایه!') : '';
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/images');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };
};

module.exports = ImageValidator;