const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const TicketMessageModel = require('./ticket-message');

class TicketModel extends Model{};
TicketModel.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'waiting'
    }
}, {
    sequelize,
    modelName: 'tickets'
});

// tickets 1:N messages
TicketModel.hasMany(TicketMessageModel);
TicketMessageModel.belongsTo(TicketModel, { constraints: true, onDelete: 'CASCADE' });

module.exports = TicketModel;