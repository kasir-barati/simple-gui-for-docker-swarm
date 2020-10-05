const UserService = require('../../services/user');

class UserController {
    static async getProfile (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { email, balance, phone, fullname } = req.session.user;

            res.render('user/profile', {
                email,
                phone,
                isAdmin,
                balance,
                messages,
                fullname,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - User profile'
            });
        } catch (error) { next(error) };
    };

    static async postUpdateProfile (req, res, next) {
        try {
            const { email, phone, fullname } = req.body;
            const { id } = req.session.user;
            
            await UserService.updateUser(id, email, phone, fullname);
            req.flash('messages', 'اطلاعاتت ویرایش شدن');
            res.redirect('/user/profile');
        } catch (error) { next(error) };
    };

    static async postPasswordReset (req, res, next) {
        try {
            const { id } = req.session.user;
            const { newPassword } = req.body;
            
            await UserService.updatePassword(id, newPassword);

            req.flash('messages', 'رمز عبور جدیدت رو به ایمیلت فرستادیم. برو حالشو ببر.');
            res.redirect('/user/profile');
        } catch (error) { next(error) };
    };

    static async getPayments (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { id, email, balance, fullname } = req.session.user;
            const { payments } = await UserService.userPayments(id);

            res.render('user/payments', {
                email,
                isAdmin,
                balance,
                messages,
                fullname,
                payments,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - User Payments'
            });
        } catch (error) { next(error) };
    };

    static async postPayment (req, res, next) {
        try {
            const { amount } = req.body;
            const { id } = req.session.user;
            const { response } = await UserService.userPay(id, amount);
            
            if (response.status == 100) {
                res.redirect(response.url);
            } else {
                req.flash('errorMessages', 'پرداخت انجام نشد!');
                res.redirect('/user/payments');
            };
        } catch (error) { next(error) };
    };

    static async getPaymentVerification (req, res, next) {
        try {
            const { id } = req.params;
            const authority = req.originalUrl.split('?')[1].split('&')[0].split('=')[1];
            const { response } = await UserService.getPaymentVerification(id, authority);

            console.log(response);
            if (response.status == 100) {
                req.flash('messages', 'پرداخت انجام شد!');
                res.redirect('/user/payments');
            } else {
                req.flash('errorMessages', 'پرداخت انجام نشد!');
                res.redirect('/user/payments');
            };
        } catch (error) { next(error) };
    };

    static async getTickets (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { id, email, balance, fullname } = req.session.user;
            let tickets;

            if (isAdmin) {
                tickets = await UserService.getAllTickets();
            } else {
                tickets = await UserService.getTickets(id);
            };

            res.render('user/tickets', {
                email,
                isAdmin,
                tickets,
                balance,
                messages,
                fullname,
                projectId: '',
                errorMessages,
                pageTitle: 'Ariana-Cloud - User tickets'
            });
        } catch (error) { next(error) };
    };

    static async postTicket (req, res, next) {
        try {   
            const { files } = req.files;
            const { id } = req.session.user;
            const { title, message } = req.body;

            await UserService.postTicket(id, title, message, files);

            req.flash('messages', 'تیکت ساخته شد');
            res.redirect('/user/tickets');
        } catch (error) { next(error) };
    };

    static async getTicket (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { id: userId, email, balance, fullname } = req.session.user;
            const { ticket, ticketMessages, support } = await UserService.getTicket(id);

            res.render('user/ticket', { 
                email,
                ticket, 
                userId,
                support,
                isAdmin,
                balance,
                messages,
                fullname,
                errorMessages,
                projectId: '',
                ticketMessages,
                pageTitle: 'Ariana-Cloud - User chat'
            });
        } catch (error) { next(error) };
    };

    static async deleteTicket(req, res, next) {
        try {
            const { id } = req.params;
            
            await UserService.deleteTicket(id);

            req.flash('messages', 'تیکت حذف شد');
            res.redirect('/user/tickets');
        } catch (error) { next(error) };
    };

    static async postTicketMessage(req, res, next) {
        try {
            const { id: userId } = req.session.user;
            const { isAdmin } = req.session;
            const { message } = req.body;
            const { files } = req.files;
            const { id } = req.params;

            await UserService.postTicketMessage(id, message, files, userId, isAdmin);

            req.flash('messages', 'پیغوم جدیدت ثبتیده شد');
            res.redirect(`/user/tickets/${id}`);
        } catch (error) { next(error) };
    };
};

module.exports = UserController;