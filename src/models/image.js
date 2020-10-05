const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('./index');
const ProjectModel = require('./project');
const DatabaseModel = require('./database');

class ImageModel extends Model {};
ImageModel.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
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
    },
    versions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    }
}, {
    sequelize,
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    modelName: 'images'
});

// images 1:N databases
ImageModel.hasMany(DatabaseModel);
DatabaseModel.belongsTo(ImageModel, { constraints: true });
// images 1:N projects
ImageModel.hasMany(ProjectModel);
ProjectModel.belongsTo(ImageModel, { constraints: true });

module.exports = ImageModel;