const AdminService = require('../../services/admin');

class AdminController {    
    static async getAdmins (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const { email, balance, fullname } = req.session.user;
            const errorMessages = req.flash('errorMessages');
            const { admins } = await AdminService.admins();
            const { users } = await AdminService.users();

            res.render('admin/admins', {
                email,
                users,
                admins,
                balance,
                isAdmin,
                fullname,
                messages,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - Register admin'
            });
        } catch (error) { next(error) };
    };

    static async postCreateAdmin (req, res, next) {
        try {
            const { email, password, fullname, phone } = req.body;
            
            await AdminService.createAdmin(email, password, fullname, phone);

            req.flash('messages', `ادمین جدیدتم اضافه شد.`);
            res.redirect('/admin/admins');
        } catch (error) { next(error) };
    };

    static async postDeleteUser (req, res, next) {
        try {
            const { id } = req.params;
            
            await AdminService.deleteUser(id);

            req.flash('messages', `کاربر حذف شد.`);
            res.redirect('/admin/admins');
        } catch (error) { next(error) };
    };

    static async getUserPayments (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            const { users, payments } = await AdminService.payments();

            res.render('admin/user-payments', {
                email,
                users,
                balance,
                isAdmin,
                payments,
                fullname,
                messages,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - Register admin'
            });
        } catch (error) { next(error) };
    }
};

module.exports = AdminController;