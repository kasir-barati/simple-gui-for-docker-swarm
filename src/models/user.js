const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Validator = require('../utils/validator');
const TokenModel = require('./token');
const ProjectModel = require('./project');
const DatabaseModel = require('./database');
const UserPaymentModel = require('./user-payment');
const UserTransactionModel = require('./user-transaction');
const TicketModel = require('./ticket');
const TicketMessageModel = require('./ticket-message');

class UserModel extends Model {};
UserModel.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullname: DataTypes.STRING,
    phone: DataTypes.STRING,
    balance: {
        type: DataTypes.REAL,
        defaultValue: 5000,
        validate: {
            isFloat: true
        }
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    phoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    avatar: DataTypes.STRING
}, { 
    sequelize,
    modelName: 'users'
});

// user 1:N token
UserModel.hasMany(TokenModel);
TokenModel.belongsTo(UserModel, { constraints: true });
// user 1:N payment
UserModel.hasMany(UserPaymentModel);
UserPaymentModel.belongsTo(UserModel, { constraints: true });
// users 1:N userTransactions
UserModel.hasMany(UserTransactionModel);
UserTransactionModel.belongsTo(UserModel, { constraints: true });
// users 1:N tickets
UserModel.hasMany(TicketModel);
TicketModel.belongsTo(UserModel, { constraints: true, onDelete: 'CASCADE' });
// user 1:N project
UserModel.hasMany(ProjectModel);
ProjectModel.belongsTo(UserModel, { constraints: true, onDelete: 'CASCADE' });
// user 1:N database
UserModel.hasMany(DatabaseModel);
DatabaseModel.belongsTo(UserModel, { constraints: true, onDelete: 'CASCADE' });
// users 1:N messages
UserModel.hasMany(TicketMessageModel);
TicketMessageModel.belongsTo(UserModel, { constraints: true, onDelete: 'CASCADE' });

module.exports = UserModel;