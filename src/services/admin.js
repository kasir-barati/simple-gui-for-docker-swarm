const bcryptjs = require('bcryptjs');

const UserModel = require('../models/user');
const { bcryptjsSalt } = require('../config');
const UserPaymentModel = require('../models/user-payment');

class AdminService {
    /**
     * return all admins
     */
    static async admins () {
        try {
            const admins = await UserModel.findAll({ where: { role: 'admin' }});

            return { admins };
        } catch (error) { throw error };
    };

    /**
     * Create a admin
     * @param {string} email - The email of the admin.
     * @param {string} phone - The phone of the admin.
     * @param {string} password - The password of the admin.
     * @param {string} fullname - The full name of the admin.
     */
    static async createAdmin (email, password, fullname, phone) {
        try {
            const hashedPassword = await bcryptjs.hash(password, Number(bcryptjsSalt));
            const admin = await UserModel.create({ email, password: hashedPassword, fullname, phone, role: 'admin', balance: 1000000, emailVerified: true });

            return { admin };
        } catch (error) { throw error };
    };

    /**
     * return all users (role = user)
     */
    static async users () {
        try {
            const users = await UserModel.findAll({ where: { role: 'user' }});

            return { users };
        } catch (error) { throw error };
    };

    /**
     * delete user
     * @param {UUID} id user id
     */
    static async deleteUser (id) {
        try {
            const user = await UserModel.findByPk(id);

            await user.destroy();
            return;
        } catch (error) { throw error };
    };

    /**
     * return all users and their payments history
     */
    static async payments () {
        try {
            const users = await UserModel.findAll();
            const payments = await UserPaymentModel.findAll();

            return { users, payments };
        } catch (error) { throw error };
    }
};

module.exports = AdminService;