const bcryptjs = require('bcryptjs');

const Validator = require('../../utils/validator');
const TokenModel = require('../../models/token');
const UserModel = require('../../models/user');

class IndexValidator {
    static async postLogin (req, res, next) {
        try {
            const { email, password } = req.body;
            const errorMessages = [];

            if (!Validator.isEmail(email)) {
                errorMessages.push('یه ایمیل خواستمو، یه ایمیل بینویس.');
            } else {
                const user = await UserModel.findOne({ where: { email }});

                if (!user) {
                    errorMessages.push('ایمیل یا رمز عبورت اشتبه.');
                } else {
                    if (!Validator.isPassword(password)) {
                        errorMessages.push('رمز عبورتو یا ایمیلتو درست وارد نکردی.')
                    } else {
                        !await bcryptjs.compare(password, user.password) ? errorMessages.push('رمز عبورتو یا ایملتو غلط زدی.') : '';
                    };
                };
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/login');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postRegister (req, res, next) {
        try {
            const { email, fullname, password, confirmPassword, phone } = req.body;
            const errorMessages = [];

            if (!Validator.isEmail(email)) {
                errorMessages.push('یه ایمیل خواستمو، درست بینویس.');
            } else {
                await UserModel.findOne({ where: { email }}) ? errorMessages.push('این ایمیله قبلا ثبت شده، یه ایمیل دیگه رو امتحان کن.') : '';
                !Validator.isPassword(password) ? errorMessages.push('رمز عبورتو عوض کن. حداقل ۸ تا کاراکتر که توش عدد و حرف باشه.') : '';
                password !== confirmPassword ? errorMessages.push('رمزای عبورت یکی نیستن. درستش کن.') : '';
                
                if (!Validator.isPhone(phone)) {
                    errorMessages.push('شماره تیلیفونت غلطه. یه شماره همراه اولی، ایرانسلی یا ... وارد بکن')
                } else {
                    await UserModel.findOne({ where: { phone }}) ? errorMessages.push('قبلا این شماره رو یکی استفاده کرده. یه شماره دیگه بده.') : '';
                }
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('adminEmail', email);
                req.flash('adminFullname', fullname);
                req.flash('adminPhone', phone);
                req.flash('errorMessages', errorMessages);
                res.redirect('/register');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postEmailVerification (req, res, next) {
        try {
            const { email } = req.body;
            const errorMessages = [];
            const user = !await UserModel.findOne({ where: { email }});
            
            if (!user) {
                errorMessages.push('ایمیلتو اشتب زدی.');
            } else if (user && user.emailVerified === true) {
                errorMessages.push('ایمیلت تائید شدس.');
            };
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/login');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async getEmailVerificationToken (req, res, next) {
        try {
            const errorMessages = [];
            const { token } = req.params;
            const activationToken = await TokenModel.findByPk(token);

            if (activationToken) {
                next();
            } else {
                errorMessages.push('توکنت رفته هوا. دوباره درخواست بده.');
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/login');
            };
        } catch (error) { next(error) };
    };

    static async postPasswordReset (req, res, next) {
        try {
            const { email } = req.body;
            const errorMessages = [];

            !await UserModel.findOne({ where: { email }}) ? errorMessages.push('ایمیلت اشتبه.') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/login');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };
};

module.exports = IndexValidator;