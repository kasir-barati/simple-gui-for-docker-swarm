const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./index');

class TokenModel extends Model {};
TokenModel.init({
    token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
            notNull: true,
            notEmpty: true
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: true,
            notEmpty: true
        }
    }
}, {
    sequelize,
    modelName: 'tokens',
    timestamps: true,
    updatedAt: false,
    paranoid: false
});

module.exports = TokenModel;