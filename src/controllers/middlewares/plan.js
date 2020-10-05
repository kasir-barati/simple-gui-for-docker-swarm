const PlanService = require('../../services/plan');

class PlanController {
    static async getPlans (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const { plans } = await PlanService.readPlans();
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;

            res.render('admin/plans', {
                plans,
                email,
                isAdmin,
                balance,
                messages,
                fullname,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - Read plans',
            });
        } catch (error) { next(error) };
    };

    static async postCreatePlan (req, res, next) {
        try {
            const { name, price, volume, ram, cpu, available, description } = req.body;

            // if the checkbox is checked, I get req.body.available -> 'on', if isn't checked, I get req.body.available -> undefined
            await PlanService.createPlan(name, available ? true : false, price, volume, ram, cpu, description);

            res.redirect('/admin/plans');
        } catch (error) { next(error) };
    };

    static async getEditPlan (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const { plan } = await PlanService.getPlan(id);
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            
            res.render('admin/edit-plan', {
                plan,
                email,
                isAdmin,
                balance,
                messages,
                fullname,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - edit plan',
            });
        } catch (error) { next(error) };
    };

    static async postEditPlan (req, res, next) {
        try {
            const { name, available, price, volume, ram, cpu, description } = req.body;
            const { id } = req.params;
            
            await PlanService.updatePlan(id, name,  available, price, volume, ram, cpu, description);

            req.flash('messages', 'پلن ویرایش شد');
            res.redirect('/admin/plans');
        } catch (error) { next(error) };
    };

    static async postDeletePlan (req, res, next) {
        try {
            const { id } = req.params;

            await PlanService.deletePlan(id);
            
            req.flash('messages', 'پلن حذف شد');
            res.redirect('/admin/plans');
        } catch (error) { next(error) };
    };
};

module.exports = PlanController;