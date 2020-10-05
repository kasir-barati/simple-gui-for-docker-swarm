const { promises: fs } = require('fs');
const path = require('path');

const ImageModel = require('../models/image');
const PlanModel = require('../models/plan');

class ImageService {
    /**
     * Read all images fron database
     * @return {array} images
     */
    static async readImages () {
        try {
            const images = await ImageModel.findAll();

            return { images };
        } catch (error) { throw error };
    };

    static async createImage (name, type, versions, planName, file) {
        try {
            const plan = await PlanModel.findOne({ where: { name: planName }});
            const oldFile = await fs.readFile(file.path);
            const imageDir = path.join(__dirname, '..', '..', 'public', 'images', 'docker-icons');

            const filePath = path.join(imageDir, file.name);
            await fs.writeFile(filePath, oldFile);
            await fs.unlink(file.path);

            versions = versions.split(',');
            await ImageModel.create({
                name, type, versions, planId: plan.id
            });

            return;
        } catch (error) { throw error };
    };

    /**
     * read image data from database
     * @param {UUID} id image ID
     * @return {object} image
     */
    static async readImage (id) {
        try {
            const image = await ImageModel.findByPk(id);

            return { image };
        } catch (error) { throw error };
    };

    static async updateImage (id, name, type, versions, planName, file) {
        try {
            const plan = await PlanModel.findOne({ where: { name: planName }});
            const image = await ImageModel.findByPk(id);

            if (file.name) {
                const oldFile = await fs.readFile(file.path);
                const oldFilePath = path.join(__dirname, '..', '..', 'public', 'docker-icons', 'images', `${image.name}.png`);
                const imageDir = path.join(__dirname, '..', '..', 'public', 'docker-icons', 'images');
                const filePath = path.join(imageDir, file.name);

                await fs.unlink(oldFilePath);
                await fs.writeFile(filePath, oldFile);
                await fs.unlink(file.path);
            };

            versions = versions.split(',');
            await image.update({name, type, versions, planId: plan.id});

            return;
        } catch (error) { throw error };
    };

    /**
     * delete (row) a record from images
     * @param {UUID} id image ID
     */
    static async deleteImage (id) {
        try {
            const image = await ImageModel.findByPk(id);
            const filePath = path.join(__dirname, '..', '..', 'public', 'images', `${image.name}.png`);

            await fs.unlink(filePath);
            await image.destroy();

            return;
        } catch (error) { throw error };
    };

    static async getImage (id) {
        try {
            const image = await ImageModel.findByPk(id);

            return { image };
        } catch (error) { throw error };
    };
};

module.exports = ImageService;