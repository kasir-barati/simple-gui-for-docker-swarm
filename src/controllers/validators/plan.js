const Validator = require('../../utils/validator');
const PlanModel = require('../../models/plan');

class PlanValidator {
    static async postCreatePlan (req, res, next) {
        try {
            const { name, price, volume, ram, cpu, description } = req.body;
            const errorMessages = [];

            await PlanModel.findOne({ where: { name }}) ? errorMessages.push('اسم پلنتو عوض کن. این اسم قبلا انتخاب شده') : '';
            !Validator.isNumeric(volume) ? errorMessages.push('حافظه رو باس عدد بدی.') : '';
            !ram.match(/(GB)|(B)|(gb)|b/) ? errorMessages.push('رمو باس با این فرمت وارد کنی: 2GB یا 1024B') : '';
            !Validator.isNumeric(cpu) ? errorMessages.push('سی‌پی‌یو رو باس عدد بدی.') : '';
            !Validator.isNumeric(price) ? errorMessages.push('قیمت پلنو باس عدد بدی.') : '';
            !Validator.isSmallerThan(200, description) ? errorMessages.push('توضیحاتی که واسه این پلنه نوشتی خیلی زیاده، چخبره؟ کمش کن.') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/plans');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async getEditPlan (req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];

            !await PlanModel.findByPk(id) ? errorMessages.push('پلنی با این آی دی نداریم دایه!') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/plans');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postEditPlan (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.params;
            const plan = await PlanModel.findByPk(id);
            const { name, price, volume, ram, cpu, description } = req.body;

            if (plan.name !== name) {
                await PlanModel.findOne({ where: { name }}) ? errorMessages.push('اسم پلنتو عوض کن. این اسم قبلا انتخاب شده') : '';
            };
            !await PlanModel.findByPk(id) ? errorMessages.push('پلنی با این آی دی نداریم دایه!') : '';
            !Validator.isNumeric(volume) ? errorMessages.push('حافظه رو باس عدد بدی.') : '';
            !Validator.isNumeric(cpu) ? errorMessages.push('سی‌پی‌یو رو باس عدد بدی.') : '';
            !ram.match(/(GB)|(B)|(gb)|b/) ? errorMessages.push('رمو باس با این فرمت وارد کنی: 2GB یا 1024B') : '';
            !Validator.isNumeric(price) ? errorMessages.push('قیمت پلنو باس عدد بدی.') : '';
            !Validator.isSmallerThan(200, description) ? errorMessages.push('توضیحاتی که واسه این پلنه نوشتی خیلی زیاده، چخبره؟ کمش کن.') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/plans');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postDeletePlan (req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];

            !await PlanModel.findByPk(id) ? errorMessages.push('پلنی با این آی دی نداریم دایه!') : '';
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/plans');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };
};

module.exports = PlanValidator;