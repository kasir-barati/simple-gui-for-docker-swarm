const path = require('path');
const { promises: fs } = require('fs');

const nodemailer = require('nodemailer');

const { gmailPassword, gmailUsername } = require('../config');

const transporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: {
        user: gmailUsername,
        pass: gmailPassword
    }
});

class EmailService {
    /**
     * Sending email
     * @param {string} to Destination email
     * @param {string} subject Email title
     * @param {string} text Email content
     */
    static sendMail (to, subject, text) {
        try {
            const mailOptions = {
                from: gmailUsername,
                to,
                subject,
                html
            };

            return new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(info);
                    };
                });
            });
        } catch (error) {
            Validator.throwErrorInModels(error);
        };
    };

    /**
     * Email activation content
     * @param {string} token Email activation token
     * @return {string} emailContent
     */
    static async emailActivationContent (token) {
        let emailContent = await fs.readFile(path.join(__dirname, '..', '..', 'public', 'html', 'email-activation.html'));

        emailContent = emailContent.toString();
        emailContent = emailContent.replace(/passwordResetToken/g, token);

        return { emailContent };
    };

    /**
     * Password reset content
     * @param {string} newPassword New password
     */
    static async passwordResetContent (newPassword) {
        let emailContent = await fs.readFile(path.join(__dirname, '..', '..', 'public', 'html', 'password-reset.html'));

        emailContent = emailContent.toString();
        emailContent = emailContent.replace(/newPassword/g, newPassword);

        return { emailContent };
    };
};

module.exports = EmailService;