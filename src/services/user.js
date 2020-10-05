const path = require('path');
const crypto = require('crypto');
const { promises: fs, exists } = require('fs');

const bcryptjs = require('bcryptjs');
const ZarinpalCheckout = require('zarinpal-checkout')

const EmailService = require('./email');
const UserModel = require('../models/user');
const UserPaymentModel = require('../models/user-payment');
const TicketModel = require('../models/ticket');
const TicketMessageModel = require('../models/ticket-message');
const { bcryptjsSalt, baseUrl } = require('../config');

const zarinpal = ZarinpalCheckout.create('cde29146-5762-11e9-b614-000c295eb8fc', true);

class UserService {
    /**
     * update user informations
     * @param {UUID} id user id (database)
     * @param {string} email user email
     * @param {string} phone user phone
     * @param {string} fullname user full name
     */
    static async updateUser (id, email, phone, fullname) {
        try {
            const user = await UserModel.findByPk(id);

            if (user.email !== email) {
                const token = await TokenModel.create({
                    token: crypto.randomBytes(16).toString('hex'),
                    userEmail: email,
                    type: 'email-activation'
                });
                const emailContent = `برای فعال کردن ایمیلت روی این لینک بکلیک ${baseUrl}/email-verification/${token.token}`;
    
                await EmailService.sendMail(email, 'Ariana-Cloud Team - Account activation', emailContent);
                user.emailVerified = false;
                user.email = email;
                user.phone = phone;
                user.fullname = fullname;
                await user.save();
            } else {
                user.phone = phone;
                user.fullname = fullname;
                await user.save();
            };

            return;
        } catch (error) { throw error };
    };

    /**
     * change user password
     * @param {UUID} id user id
     * @param {string} password new password
     */
    static async updatePassword (id, password) {
        try {
            const user = await UserModel.findByPk(id);
            const hashedPassword = await bcryptjs.hash(password, bcryptjsSalt);

            user.password = hashedPassword;
            await user.save();
            return;
        } catch (error) { throw error };
    };

    /**
     * read all payments history
     * @param {UUID} id user ID (database)
     * @return {Object[]} payments
     */
    static async userPayments (id) {
        try {
            const payments = await UserPaymentModel.findAll({ where: { userId: id }});

            return { payments };
        } catch (error) { throw error };
    };

    /**
     * show payment page for the user
     * @param {UUID} id user id (database)
     * @param {number} amount Toman
     */
    static async userPay (id, amount) {
        try {
            const user = UserModel.findByPk(id);
            const userPayment = await UserPaymentModel.create({
                amount,
                status: 'pending',
                userId: id
            });
            const response = await zarinpal.PaymentRequest({
                Amount: amount,
                CallbackURL: `${baseUrl}/user/payments/verification/${userPayment.id}`,
                Description: 'شارژ اکانت',
                Email: user.email,
                Mobile: user.phone
            });

            return { response };
        } catch (error) { throw error };
    };

    /**
     * verifying payment
     * @param {UUIDV4} id UserPaymentModel ID (database)
     * @param {String} authority
     * @return {Object} response
     */
    static async getPaymentVerification (id, authority) {
        try {
            const userPayment = await UserPaymentModel.findByPk(id);
            const user = await UserModel.findByPk(userPayment.userId);
            const response = await zarinpal.PaymentVerification({
                Amount: userPayment.amount,
                Authority: authority,
            });

            if (response.status == 100) {
                // save { status: 100, RefID: 12345678 }
                userPayment.status = 'paid';
                userPayment.refId = response.RefID;
                await userPayment.save();
                user.balance = Number(user.balance) + Number(userPayment.amount);
                await user.save();
            } else {
                // do something { status: -21, RefID: 0 }. failor transaction
                userPayment.status = 'not-paid';
                userPayment.refId = response.RefID;
                await userPayment.save();
            };
    
            return { response };
        } catch (error) { throw error };
    };

    /**
     * Read all tickets
     * @param {UUID} id user id (database)
     * @return {Object[]} user's tickets
     */
    static async getTickets (id) {
        try {
            return await TicketModel.findAll({ where: { userId: id }});
        } catch (error) { throw error };
    };

    /**
     * return all tickets with 'waiting' status
     * @return {Object[]} tickets
     */
    static async getAllTickets () {
        try {
            return await TicketModel.findAll({ where: { status: 'waiting' }});
        } catch (error) { throw error };
    };

    static async postTicket (id, title, message, files) {
        try {
            const ticket = await TicketModel.create({ 
                title,
                userId: id,
                status: 'waiting'
            });
            const userDirectory = path.join(__dirname, '..', '..', 'public', 'images', 'ticket-pictures', id);
            const paths = [];

            exists(userDirectory, async isExists => !isExists ? await fs.mkdir(userDirectory) : '');

            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const oldFile = await fs.readFile(files[i].path);
                    
                    paths.push(path.join(userDirectory, `${crypto.randomBytes(8).toString('hex')}.${files[i].type.split('/')[1]}`));
                    await fs.writeFile(paths[i], oldFile);
                    await fs.unlink(files[i].path);
                    paths[i] = `${paths[i].split('public')[1]}`;
                };
            } else if (files.name) {
                const oldFile = await fs.readFile(files.path);
                
                paths.push(path.join(userDirectory, `${crypto.randomBytes(8).toString('hex')}.${files.type.split('/')[1]}`));
                await fs.writeFile(paths[0], oldFile);
                await fs.unlink(files.path);
                paths[0] = `${paths[0].split('public')[1]}`;
            }

            await TicketMessageModel.create({
                message,
                userId: id,
                pics: paths,
                ticketId: ticket.id
            });

            return;
        } catch (error) { throw error };
    };

    /**
     * read ticket and it messages
     * @param {UUID} id ticket ID
     * @return {Object} ticket
     * @return {Object[]} ticket messages
     * @return {Objecy} support (admin user)
     */
    static async getTicket(id) {
        try {
            const ticket = await TicketModel.findByPk(id);
            const ticketMessages = await TicketMessageModel.findAll({ where: { ticketId: ticket.id }});
            let support;

            for (let i = 0; i < ticketMessages.length; i++) {
                if (ticketMessages[i].userId !== id) {
                    support = await UserModel.findByPk(ticketMessages[i].userId);
                };
            };

            return { ticket, ticketMessages, support };
        } catch (error) { throw error };
    };

    static async deleteTicket(id) {
        try {
            const ticket = await TicketModel.findByPk(id);
            const ticketMessages = await TicketMessageModel.findAll({ where: { ticketId: id }});

            exists(userDirectory, async isExists => !isExists ? await fs.mkdir(userDirectory) : '');
            ticketMessages.forEach(async ticketMessage => {
                for (let i = 0; i < ticketMessage.pics.length; i++) {
                    const filePath = path.join(__dirname, '..', '..', 'public', ticketMessage.pics[i]);
                    await fs.unlink(filePath);
                };
                await ticketMessage.destroy();
            });
            
            await ticket.destroy();
            return { ticket };
        } catch (error) {
            throw error;
        };
    };

    /**
     * create new message for the ticket
     * @param {UUID} id ticket id
     * @param {string} message new message
     * @param {string[]} files files path
     * @param {UUID} userId user id
     */
    static async postTicketMessage(id, message, files, userId, isAdmin) {
        try {
            const userDirectory = path.join(__dirname, '..', '..', 'public', 'images', 'ticket-pictures', userId);
            const ticket = await TicketModel.findByPk(id);
            const paths = [];

            exists(userDirectory, async isExists => !isExists ? await fs.mkdir(userDirectory) : '');

            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const oldFile = await fs.readFile(files[i].path);
                    
                    paths.push(path.join(userDirectory, `${crypto.randomBytes(8).toString('hex')}.${files[i].type.split('/')[1]}`));
                    await fs.writeFile(paths[i], oldFile);
                    await fs.unlink(files[i].path);
                    paths[i] = `${paths[i].split('public')[1]}`;
                };
            } else if (files.name) {
                const oldFile = await fs.readFile(files.path);

                paths.push(path.join(userDirectory, `${crypto.randomBytes(8).toString('hex')}.${files.type.split('/')[1]}`));
                await fs.writeFile(paths[0], oldFile);
                await fs.unlink(files.path);
                paths[0] = `${paths[0].split('public')[1]}`;
            };

            const ticketMessage = await TicketMessageModel.create({ 
                ticketId: id,
                pics: paths,
                message, 
                userId
            });

            if (isAdmin) {
                ticket.status = 'answered';
                await ticket.save();
            } else {
                ticket.status = 'waiting';
                await ticket.save();
            };

            return;
        } catch (error) { throw error };
    };
};
module.exports = UserService;