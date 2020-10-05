const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const ImageModel = require('./image');
const ProjectModel = require('./project');
const DatabaseModel = require('./database');

class PlanModel extends Model {};
PlanModel.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true
        }
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    price: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true
        }
    },
    volume: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true
        }
    },
    ram: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true
        }
    },
    cpu: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true
        }
    }
},{
    sequelize,
    modelName: 'plans',
    timestamps: true,
    paranoid: false
});

// plan 1:N image
PlanModel.hasMany(ImageModel);
ImageModel.belongsTo(PlanModel, { constraints: true });
// plan 1:N database
PlanModel.hasMany(DatabaseModel);
DatabaseModel.belongsTo(PlanModel, { constraints: true, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
// plan 1:N project
PlanModel.hasMany(ProjectModel);
ProjectModel.belongsTo(PlanModel, { constraints: true });

module.exports = PlanModel;