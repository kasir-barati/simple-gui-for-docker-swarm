const path = require('path');
const { promises: fs } = require('fs');

// const Cddnss = require('cloudflare-ddns-sync').default;

// const { cloudflareToken, cloudflareUser } = require('../config');
// const cddnss = new Cddnss(cloudflareUser, cloudflareToken);

const Spawn = require('../utils/spawn');
const PlanModel = require('../models/plan');
const ImageModel = require('../models/image');
const ProjectModel = require('../models/project');
const DatabaseModel = require('../models/database');
const DockerStackService = require('./docker-stack');
const DockerVolumeService = require('./docker-volume');
const DockerServiceService = require('./docker-service');
const DockerNetworkService = require('./docker-network');
const DockerContainerService = require('./docker-container');

class PreparedProjectService {
    /**
     * Read all CMS projects
     * @param {UUID} id user id
     * @param {Boolean} isAdmin 
     * @return {Object[]} images
     * @return {object[]} preparedProjects
     */
    static async getProjects (id, isAdmin) {
        try {
            const images = await ImageModel.findAll({ where: { type: 'prepared' }});
            let preparedProjects;
            
            if (isAdmin) {
                preparedProjects = await ProjectModel.findAll({
                    include: {
                        model: ImageModel,
                        as: 'image',
                        where: { type: 'prepared' }
                    }
                });
            } else {
                preparedProjects = await ProjectModel.findAll({
                    where: { userId: id },
                    include: {
                        model: ImageModel,
                        as: 'image',
                        where: { type: 'prepared' }
                    }
                });
            };

            return { preparedProjects, images };
        } catch (error) { throw error };
    };

    /**
     * Read all CMS images and plans
     * @return {array} images
     * @return {array} plans
     */
    static async readPlansAndImages () {
        try {
            const images = await ImageModel.findAll({ where: { type: 'prepared' }});
            const plans = await PlanModel.findAll({ where: { available: true }});

            return { images, plans };
        } catch (error) { throw error };
    };

    static async inspectProject (id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const { inspect: projectInspect } = await DockerServiceService.inspect(`${project.name}_${image.name}`);

            if (image.name !== 'ghost') {
                const { inspect: databaseInspect } = await DockerServiceService.inspect(`${project.name}_db`);
                return { projectInspect, databaseInspect };
            } else {
                return { projectInspect, databaseInspect: {} };
            };
        } catch (error) { throw error };
    };

    /**
     * create CMD projects
     * @param {UUID} userId prepared project's owner ID
     * @param {UUID} planId plans's ID that user selected
     * @param {UUID} imageId image's ID that user selected
     * @param {string} projectName project name
     */
    static async createProject (userId, planId, imageId, projectName) {
        let project, database, domain, projectImage;
        try {
            const plan = await PlanModel.findByPk(planId);
            const databaseImage = await ImageModel.findOne({ where: { name: 'mysql' }});
            projectImage = await ImageModel.findByPk(imageId);

            /**
             * create cloudflare record
             */
            console.log('create cloudflare record');
            // domain = await cddnss.syncRecord({
            //     name: `${projectName}.arianacloud.ir`,
            //     type: 'A',
            //     proxied: true,
            //     ttl: 1,
            //     priority: 0,
            //     content: '1.2.3.4'
            // });

            /**
             * deploy on docker
             */
            console.log('deploy on docker');
            // await DockerVolumeService.create(`${projectName}_${projectImage.name}`, plan.volume);
            // if (projectImage.name !== 'ghost') {
            //     await DockerVolumeService.create(`${projectName}_db`, plan.volume);
            // };
            const { projectPort } = await DockerStackService.deployPreparedProjects(projectName, projectImage.name, plan);

            /**
             * Create nginx file
             */
            console.log('Create nginx file');
            let nginxFile = await fs.readFile(path.join(__dirname, 'nginx-file.conf'));
            nginxFile = nginxFile.toString();
            nginxFile = nginxFile.replace(/projectName/g, projectName);
            nginxFile = nginxFile.replace(/projectPort/g, projectPort);
            await fs.writeFile(`/etc/nginx/conf.d/${projectName}.conf`, nginxFile);
            await Spawn.execute('systemctl reload nginx');

            /**
             * save record in database
             */
            console.log('save record in database');
            project = await ProjectModel.create({
                name: projectName, 
                scale: 1, 
                imageId, 
                url: `${projectName}.arianacloud.ir`,
                planId,
                userId
            });
            if (projectImage.name !== 'ghost') {
                database = await DatabaseModel.create({
                    name: projectName, 
                    scale: 1, 
                    imageId: databaseImage.id,
                    planId,
                    userId
                });
            };

            return;
        } catch (error) { 
            DockerVolumeService.prune();
            DockerVolumeService.remove([`${projectName}_${projectImage.name}`, `${projectName}_db`]);
            // domain ? await cddnss.removeRecord(`${projectName}.arianacloud.ir`) : '';
            try {
                await fs.stat(`/etc/nginx/conf.d/${projectName}.conf`);
                await fs.unlink(`/etc/nginx/conf.d/${projectName}.conf`);
            } catch (error) { console.error(error) };
            project ? project.destroy() : '';
            database ? database.destroy() : '';
            throw error;
        };
    };

    static async deleteProject (id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const database = await DatabaseModel.findOne({ where: { name: project.name }});
            
            await DockerStackService.removeStack(project.name);
            await DockerVolumeService.prune();
            await DockerNetworkService.prune();
            try {
                await fs.stat(`/etc/nginx/conf.d/${project.name}.conf`);
                await fs.unlink(`/etc/nginx/conf.d/${project.name}.conf`);
            } catch (error) { console.error(error) };
            // await cddnss.removeRecord(`${project.name}.arianacloud.ir`);
            await project.destroy();
            if (database) {
                await database.destroy();
            };

            return;
        } catch (error) { throw error };
    };

    /**
     * return project logs
     * @param {UUID} id project ID that comes from database
     */
    static async getProjectLogs (id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const { logs } = await DockerServiceService.logs(`${project.name}_${image.name}`);
            console.log(logs);

            return { logs };
        } catch (error) { throw error };
    };

    static async getProjectPlan (id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const plan = await PlanModel.findByPk(project.planId);
            
            return { plan };
        } catch (error) { throw error };
    };

    /**
     * Read all plans
     * @return {Object[]} plans
     */
    static async getPlans () {
        try {
            const plans = await PlanModel.findAll();

            return { plans };
        } catch (error) { throw error };
    };

    static async getProjectStats (id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const projectContainerName = await DockerContainerService.findContainerName(`${project.name}_${image.name}`);
            const { stats } = await DockerContainerService.stats(projectContainerName);

            return { stats };
        } catch (error) { throw error; }
    };

    static async execCommand (id, command) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const projectContainerName = await DockerContainerService.findContainerName(`${project.name}_${image.name}`);
            const commandResult = await DockerContainerService.exec(projectContainerName, command);
            
            return { commandResult };
        } catch (error) { throw error };
    };

    /**
     * update project resources
     * @param {UUID} id project (database)
     * @param {UUID} planId plan id (database)
     */
    static async updateResources (id, planId) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const plan = await PlanModel.findByPk(planId);
            
            await DockerServiceService.updateResource(`${project.name}_${image.name}`, plan);
            await DockerServiceService.updateResource(`${project.name}_db`, plan);
            project.planId = planId;
            await project.save();
            return;
        } catch (error) { throw error };
    };

    static async addEnv (id, envKey, envValue) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            
            await DockerServiceService.addEnv(`${project.name}_${image.name}`, `${envKey.trim()}=${envValue.trim()}`);
            return;
        } catch (error) { throw error };
    };

    static async removeEnv (id, envKey) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            
            await DockerServiceService.removeEnv(`${project.name}_${image.name}`, envKey.trim());
            return;
        } catch (error) { throw error };
    };
};

module.exports = PreparedProjectService;