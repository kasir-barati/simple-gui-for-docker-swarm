const bcryptjs = require('bcryptjs');

const Validator = require('../../utils/validator');
const UserPaymentModel = require('../../models/user-payment');
const TicketModel = require('../../models/ticket');
const UserModel = require('../../models/user');

class UserValidator {
    static async postUpdateProfile (req, res, next) {
        try {
            const errorMessages = [];
            const { email: newEmail, phone: newPhone } = req.body;
            const { email: oldEmail, phone: oldPhone } = req.session.user;

            if (!Validator.isEmail(newEmail)) {
                errorMessages.push('یه ایمیل خواستمو، درست بینویس.');
            };
            if (newEmail !== oldEmail) {
                await UserModel.findOne({ where: { email: newEmail }}) ? errorMessages.push('این ایمیله قبلا ثبت شده، یه ایمیل دیگه رو امتحان کن.') : '';
            };
            if (!Validator.isPhone(newPhone)) {
                errorMessages.push('شماره تیلیفونت غلطه. یه شماره همراه اولی، ایرانسلی یا ... وارد بکن')
            } else if (newPhone !== oldPhone) {
                await UserModel.findOne({ where: { phone: newPhone }}) ? errorMessages.push('قبلا این شماره رو یکی استفاده کرده. یه شماره دیگه بده.') : '';
            };
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/projects/prepared-projects/env/${id}`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postPasswordReset (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.session.user;
            const user = await UserModel.findByPk(id);
            const { password, newPassword, confirmPassword } = req.body;

            if (!await bcryptjs.compare(password, user.password)) {
                errorMessages.push('رمز عبور رو غلط تایپیدی!')
            } else {
                newPassword !== confirmPassword ? errorMessages.push('رمز عبور جدید با تکرارش مطابقت نداره!') : '';
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/user/profile');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postPayment (req, res, next) {
        try {
            const errorMessages = [];
            const { amount } = req.body;

            !Validator.isNumeric(amount) ? errorMessages.push('میخوای حسابتو شارژ کنی یا نه؟ اگه آره، مقداری که میخوای شارژ کنی حسابتو، مثلا ۱۰ هزار تومنو این جوری بینیویس: ۱۰۰۰۰') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/user/payments`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async getPaymentVerification (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.params;
            const userPayment = await UserPaymentModel.findByPk(id);

            if (!userPayment) {
                errorMessages.push('همچین پرداختی نداشتیم! اگه مطمئنی مشکل از سمت ما هس با پشتیبانی تماس بگیر');
            } else if (userPayment.userId !== req.session.user.id) {
                errorMessages.push('این پرداختو تو انجام ندادی. اگه مطمئنی مشکل از سمت ما هس با پشتیبانی تماس بگیر');
            };
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/user/payments`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postTicket(req, res, next) {
        try {
            const { title, message } = req.body;
            const { files } = req.files;
            const errorMessages = [];

            !Validator.isAlphanumeric(title) ? errorMessages.push('عنوان تیکت رو درست بینیویس') : '';
            !Validator.isSmallerThan(1000, message) ? errorMessages.push('پیغامی که نوشتی خیلی طولانی هست. کوتاه و مختصر بینیویس') : '';
            if (files.length > 0) {
                files.forEach(f => {
                    (f.size > 3 * 1024 * 1024) ? errorMessages.push('فایلایی که آپلود میکنی بیشتر از ۳ مگا بایت نباید باشن.') : '';
                    !Validator.isPicture(f.type) ? errorMessages.push('فرمت عکسات باید :jpg ،jpeg ،bmp ،gif ،webp یا tiff باشه.') : '';
                });
            } else if (files.name) {
                (files.size > 3 * 1024 * 1024) ? errorMessages.push('فایلایی که آپلود میکنی بیشتر از ۳ مگا بایت نباید باشن.') : '';
                !Validator.isPicture(files.type) ? errorMessages.push('فرمت عکسات باید :jpg ،jpeg ،bmp ،gif ،webp یا tiff باشه.') : '';
            }

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/user/tickets`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async checkTicketId(req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];

            !await TicketModel.findByPk(id) || !Validator.isUuid(id) ? errorMessages.push('همچین تیکتی با همچین ID ای نداریمو') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/user/tickets`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postTicketMessage(req, res, next) {
        try {
            const { id } = req.params;
            const { files } = req.files;
            const { message } = req.body;
            const errorMessages = [];

            !await TicketModel.findByPk(id) ? errorMessages.push('همچی تیکتی نداشتیو!') : '';
            !Validator.isSmallerThan(1000, message) ? errorMessages.push('دایه پیامت باس زیر ۵۰۰ کاراکتر باشه.') : '';
            if (files.length > 0) {
                files.forEach(f => {
                    (f.size > 3 * 1024 * 1024) ? errorMessages.push('فایلایی که آپلود میکنی بیشتر از ۳ مگا بایت نباید باشن.') : '';
                    !Validator.isPicture(f.type) ? errorMessages.push('فرمت عکسات باید :jpg ،jpeg ،bmp ،gif ،webp یا tiff باشه.') : '';
                });
            } else if (files.name) {
                (files.size > 3 * 1024 * 1024) ? errorMessages.push('فایلایی که آپلود میکنی بیشتر از ۳ مگا بایت نباید باشن.') : '';
                !Validator.isPicture(files.type) ? errorMessages.push('فرمت عکسات باید :jpg ،jpeg ،bmp ،gif ،webp یا tiff باشه.') : '';
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/user/tickets/${id}`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };
};

module.exports = UserValidator;