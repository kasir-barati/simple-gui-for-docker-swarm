const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./index');

class DatabaseModel extends Model {};
DatabaseModel.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z0-9][a-zA-Z0-9 -_.]/
        }
    },
    scale: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
            notNull: true,
            notEmpty: true
        }
    },
    freeze: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    timestamps: true,
    paranoid: false,
    modelName: 'databases'
});

module.exports = DatabaseModel;