const path = require('path');
const { promises: fs, createWriteStream } = require('fs');

const decompress = require('decompress');
// const Cddnss = require('cloudflare-ddns-sync').default;

// const { cloudflareToken, cloudflareUser } = require('../config');
// const cddnss = new Cddnss(cloudflareUser, cloudflareToken);
const PortScanner = require('../utils/port-scanner');

const PlanModel = require('../models/plan');
const ImageModel = require('../models/image');
const ProjectModel = require('../models/project');
const DockerStackService = require('./docker-stack');
const DockerVolumeService = require('./docker-volume');
const DockerServiceService = require('./docker-service');
const DockerNetworkService = require('./docker-network');
const DockerContainerService = require('./docker-container');

class StaticProjectService {
    /**
     * read all user static projects and images
     * @param {UUID} id user id
     * @param {Boolean} isAdmin is he/she admin
     * @return {Object[]} static projects
     * @return {Object[]} images
     */
    static async getProjects(id, isAdmin) {
        try {
            const images = await ImageModel.findAll({ where: { name: 'nginx' } });
            let staticProjects;

            if (isAdmin) {
                staticProjects = await ProjectModel.findAll({
                    include: {
                        model: ImageModel,
                        as: 'image',
                        where: { name: 'nginx' }
                    }
                });
            } else {
                staticProjects = await ProjectModel.findAll({
                    where: { userId: id },
                    include: {
                        model: ImageModel,
                        as: 'image',
                        where: { name: 'nginx' }
                    }
                });
            };

            return { staticProjects, images };
        } catch (error) { throw error };
    };

    /**
     * Read all static images and plans
     * @return {array} images
     * @return {array} plans
     */
    static async readPlansAndImages() {
        try {
            const plans = await PlanModel.findAll({ where: { available: true } });

            return { plans };
        } catch (error) { throw error };
    };

    static async inspectProject(id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const { inspect: projectInspect } = await DockerServiceService.inspect(`${project.name}_${image.name}`);

            return { projectInspect };
        } catch (error) { throw error };
    };

    static async createProject(id, projectName, planId, projectFile) {
        let errorOccuredIn = 'cloudflare';
        try {
            // const plan = await PlanModel.findByPk(planId);
            // const image = await ImageModel.findOne({ where: { name: 'nginx' } });
            const extractPath = path.join(__dirname, '..', '..', 'static', 'files');
            // const projectPort = await PortScanner.unUsePort(~~(Math.random() * (11000 - 8000 + 1)) + 8000, 11000);

            /**
             * extract
             */
            const files = await decompress(projectFile.path, extractPath);
            console.log(files);
            
            /**
             * cloudflare
             */
            // await cddnss.syncRecord({
            //     name: `${projectName}.arianacloud.ir`,
            //     type: 'A',
            //     proxied: true,
            //     ttl: 1,
            //     priority: 0,
            //     content: '1.2.3.4'
            // });

            /**
             * create service on docker
             */
            // errorOccuredIn = 'docker';
            // await DockerVolumeService.create(projectName);
            // await DockerServiceService.create(`${projectName}_${image.name}`, plan, projectPort, '80', `${image.name}:${image.versions[0]}`, `${projectName}_${image.name}`);
            // const containerName = await DockerContainerService.findContainerName(`${projectName}_${image.name}`);
            // await DockerContainerService.copy(containerName, projectFile.path);
            // await DockerContainerService.exec(containerName, `unzip /usr/share/nginx/html/${projectFile.name}`);
            // await fs.unlink(projectFile.path);

            /**
             * Create nginx file
             */
            // errorOccuredIn = 'nginx';
            // let nginxFile = await fs.readFile(path.join(__dirname, 'nginx-file.conf'));
            // nginxFile = nginxFile.toString();
            // nginxFile = nginxFile.replace(/projectName/g, projectName);
            // nginxFile = nginxFile.replace(/projectPort/g, projectPort);
            // await fs.writeFile(`/etc/nginx/conf.d/${projectName}.conf`, nginxFile);
            // await Spawn.execute('systemctl reload nginx');

            /**
             * save record in database
             */
            // errorOccuredIn = 'database';
            // await ProjectModel.create({
            //     name: projectName,
            //     scale: 1,
            //     imageId: image.id,
            //     url: `${projectName}.arianacloud.ir`,
            //     planId,
            //     userId
            // });
        } catch (error) {
            console.error(error);
            switch (errorOccuredIn) {
                case 'database':
                case 'nginx':
                    const fileStat = await fs.stat(`/etc/nginx/conf.d/${projectName}.conf`)
                    fileStat ? await fs.unlink(`/etc/nginx/conf.d/${projectName}.conf`) : '';
                case 'docker':
                    await DockerVolumeService.prune();
                case 'clooudflare':
                    // cddnss.removeRecord(`${projectName}.arianacloud.ir`);
                    break;
            };
        };
    };

    static async deleteProject(id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);

            await DockerStackService.removeStack(project.name);
            await DockerVolumeService.remove(`${project.name}_${image.name}`);
            await DockerVolumeService.prune();
            await DockerNetworkService.prune();
            // await cddnss.removeRecord(`${project.name}.arianacloud.ir`);
            await project.destroy();

            return;
        } catch (error) { throw error };
    };

    /**
     * return project logs
     * @param {UUID} id project ID that comes from database
     */
    static async getProjectLogs(id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const { logs } = await DockerServiceService.logs(`${project.name}_${image.name}`);

            return { logs };
        } catch (error) { throw error };
    };

    static async getProjectPlan(id) {
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
    static async getPlans() {
        try {
            const plans = await PlanModel.findAll();

            return { plans };
        } catch (error) { throw error };
    };

    static async getProjectStats(id) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const projectContainerName = await DockerContainerService.findContainerName(`${project.name}_${image.name}`);
            const { stats } = await DockerContainerService.stats(projectContainerName);

            return { stats };
        } catch (error) { throw error; }
    };

    static async execCommand(id, command) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);
            const projectContainerName = await DockerContainerService.findContainerName(`${project.name}_${image.name}`);
            const commandResult = await DockerContainerService.exec(projectContainerName, command);

            return { commandResult };
        } catch (error) { throw error };
    };

    static async updateResources(projectId, planId) {
        try {
            const project = await ProjectModel.findByPk(projectId);
            const image = await ImageModel.findByPk(project.imageId);
            const plan = await PlanModel.findByPk(planId);

            await DockerServiceService.updateResource(`${project.name}_${image.name}`, plan);
            await DockerServiceService.updateResource(`${project.name}_db`, plan);
            project.planId = planId;
            await project.save();
            return;
        } catch (error) { throw error };
    };

    static async addEnv(id, envKey, envValue) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);

            await DockerServiceService.addEnv(`${project.name}_${image.name}`, `${envKey.trim()}=${envValue.trim()}`);
            return;
        } catch (error) { throw error };
    };

    static async removeEnv(id, envKey) {
        try {
            const project = await ProjectModel.findByPk(id);
            const image = await ImageModel.findByPk(project.imageId);

            await DockerServiceService.removeEnv(`${project.name}_${image.name}`, envKey.trim());
            return;
        } catch (error) { throw error };
    };
};

module.exports = StaticProjectService;