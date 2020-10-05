const { githubClientId } = require('../../config');
const IndexService = require('../../services/index');

class IndexController {
    static async getLogin (req, res, next) {
        try {
            const email = req.flash('email');
            const errorMessages = req.flash('errorMessages');
            const messages = req.flash('messages');
            
            res.render('auth/login', {
                pageTitle: 'Ariana-Cloud - login',
                errorMessages: errorMessages,
                messages: messages,
                email
            });
        } catch (error) { next(error) };
    };

    static async postLogin (req, res, next) {
        try {
            const { email, password } = req.body;
            const { user } = await IndexService.getUser(email);

            if (user.role === 'admin') {
                req.session.isAdmin = true;
            };
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(error => {
                if (error) next(error);
            });

            res.redirect('/projects/prepared-projects');
        } catch (error) { next(error) };
    };

    static async getLogout (req, res, next) {
        try {
            req.session.destroy(error => {
                error ? next(error) : res.redirect('/login');
            });
        } catch (error) { next(error) };
    };

    static async getRegister (req, res, next) {
        try {
            const email = req.flash('email');
            const phone = req.flash('phone');
            const fullname = req.flash('fullname');
            const errorMessages = req.flash('errorMessages');
            const messages = req.flash('messages');
            
            res.render('auth/register', {
                pageTitle: 'Ariana-Cloud - Register',
                errorMessages: errorMessages,
                messages: messages,
                fullname,
                phone,
                email
            });
        } catch (error) { next(error) };
    };

    static async postRegister (req, res, next) {
        try {
            const { email, password, fullname, phone } = req.body;
            const { user } = await IndexService.createUser(email, password, fullname, phone);

            req.flash('messages', `ایمیلتو (${user.email}) یه چک کن. باس اول ایمیلتو تائید کنی.`);
            res.redirect('/login');
        } catch (error) { next(error) };
    };

    static async postEmailVerification (req, res, next) {
        try {
            const { email } = req.body;

            await IndexService.sendEmailVerification(email);

            req.flash('messages', 'ایمیلتو یه چک کن. باس الان یه ایمیل از سمت ما برات ارسال شده باشه.');
            res.redirect('/login');
        } catch (error) { next(error) };
    };

    static async getEmailVerificationToken (req, res, next) {
        try {
            const { token } = req.params;
            await IndexService.emailVerification(token);

            req.flash('messages', 'ایمیلت تائید شد. برو خوش باش. الان میتونی لاگین کنی');
            res.redirect('/login');
        } catch (error) { next(error) };
    };

    static async postPasswordReset (req, res, next) {
        try {
            const { email } = req.body;
            
            await IndexService.generateRandomPassword(email);

            req.flash('messages', 'رمز عبور جدیدت رو به ایمیلت فرستادیم. برو حالشو ببر.');
            res.redirect('/login');
        } catch (error) { next(error) };
    };

    // static async getConnectedToGithub (req, res, next) {
    //     try {
    //         req.session.githubAccessToken = accessToken;
    //         req.flash('messages', 'به گیت هابت الان وصل شدی');
    //         res.redirect('/projects/static-projects/create');
    //         req.flash('errorMessages', 'به گیت هابت الان وصل نشدی');
    //         res.redirect('/projects/static-projects/create');
    //     } catch (error) { next(error) };
    // };
};

module.exports = IndexController;