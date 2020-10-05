const Validator = require('../../utils/validator');
const UserModel = require('../../models/user');

class AdminValidator {
    static async postCreateAdmin (req, res, next) {
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
                res.redirect('/admin/admins');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async checkUserId (req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];

            !await UserModel.findByPk(id) ? errorMessages.push('همچین کاربری نداریمو!') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/admin/users');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };
};

module.exports = AdminValidator;