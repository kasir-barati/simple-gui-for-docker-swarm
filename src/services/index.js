const crypto = require('crypto');

const bcryptjs = require('bcryptjs');

const EmailService = require('./email');
const UserModel = require('../models/user');
const TokenModel = require('../models/token');
const { bcryptjsSalt, githubClientId, githubClientSecret } = require('../config');

class IndexService {
    /**
     * Create a user
     * @param {string} email - The email of the user.
     * @param {string} phone - The phone of the user.
     * @param {string} password - The password of the user.
     * @param {string} fullname - The full name of the user.
     */
    static async createUser(email, password, fullname, phone) {
        try {
            const hashedPassword = await bcryptjs.hash(password, Number(bcryptjsSalt));
            const user = await UserModel.create({ email, password: hashedPassword, fullname, phone, role: 'user' });
            const token = await TokenModel.create({
                token: crypto.randomBytes(16).toString('hex'),
                userId: user.id,
                type: 'email-activation'
            });
            const emailContent = await EmailService.emailActivationContent(token.token);

            await EmailService.sendMail(email, 'Ariana-Cloud Team - Account activation', emailContent);
            return { user };
        } catch (error) { throw error };
    };

    static async getUser(email) {
        try {
            const user = await UserModel.findOne({ where: { email } });

            return { user };
        } catch (error) { throw error };
    };

    /**
     * Verify User's email
     * @param {string} token Generated token
     */
    static async emailVerification(token) {
        const activationToken = await TokenModel.findByPk(token);
        const user = await UserModel.findByPk(activationToken.userId);

        user.emailVerified = true;
        activationToken.destroy();
        await user.save();
        return;
    };

    /**
     * Send account activation email 
     * @param {string} email User's email
     */
    static async sendEmailVerification(email) {
        try {
            const user = await UserModel.findOne({ where: { email } });
            const token = await TokenModel.findOne({
                where: {
                    userId: user.id,
                    type: 'email-activation'
                }
            });
            const newToken = await TokenModel.create({
                token: crypto.randomBytes(16).toString('hex'),
                userId: user.id,
                type: 'email-activation'
            });
            const emailContent = await EmailService.emailActivationContent(newToken.token);

            token ? token.destroy() : '';
            await EmailService.sendMail(email, 'Ariana-Cloud Team - Account activation', emailContent);
            return;
        } catch (error) { throw error };
    };

    /**
     * Generate random password and send it to the user's email
     * @param {string} email User's email
     */
    static async generateRandomPassword(email) {
        try {
            const user = await UserModel.findOne({ where: { email } });
            const password = crypto.randomBytes(6).toString('hex');
            const hashedPassword = await bcryptjs.hash(password, Number(bcryptjsSalt));
            const emailContent = await EmailService.passwordResetContent(password);

            EmailService.sendMail(email, 'Ariana-Cloud Team - Password reset', emailContent);
            user.password = hashedPassword;
            await user.save();
            return;
        } catch (error) { throw error };
    };

    /**
     * Create a admin
     * @param {string} email - The email of the admin.
     * @param {string} phone - The phone of the admin.
     * @param {string} password - The password of the admin.
     * @param {string} fullname - The full name of the admin.
     */
    static async createAdmin(email, password, fullname, phone) {
        try {
            const hashedPassword = await bcryptjs.hash(password, Number(bcryptjsSalt));
            const admin = await UserModel.create({ email, password: hashedPassword, fullname, phone, role: 'admin', balance: 1000000, emailVerified: true });

            return { admin };
        } catch (error) { throw error };
    };

    /**
     * request for the tokens and save them in the database
     * @param {UUID} id user id (database)
     * @param {string} code GitHub temporary code
     */
    // static async getGithubAccessToken(id, code) {
    //     try {
    //         const accessToken = await axios.post(`https://github.com/login/oauth/access_token`, {
    //             client_id: githubClientId,
    //             client_secret: githubClientSecret,
    //             code
    //         }, { 
    //             headers: { 
    //                 accept: 'application/json' 
    //             } 
    //         });

    //         if (res.status === 200) {
    //             return { 'accessToken': accessToken.data['access_token'] };
    //         } else {
    //             return { 'accessToken': '' };
    //         };
    //     } catch (error) { throw error };
    // };
};

module.exports = IndexService;