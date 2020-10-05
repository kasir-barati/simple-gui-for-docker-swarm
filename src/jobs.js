const cron = require('node-cron');
// const Cddnss = require('cloudflare-ddns-sync').default;

// const { cloudflareToken, cloudflareUser } = require('./config');
// const cddnss = new Cddnss(cloudflareUser, cloudflareToken);

const PlanModel = require('./models/plan');
const UserModel = require('./models/user');
const TokenModel = require('./models/token');
const ProjectModel = require('./models/project');
const DatabaseModel = require('./models/database');

const EmailService = require('./services/email');
const DockerVolumeService = require('./services/docker-volume');
const DockerNetworkService = require('./services/docker-network');
const DockerServiceService = require('./services/docker-service');
const ImageModel = require('./models/image');

cron.schedule('*/1 * * * *', async () => {
    const users = await UserModel.findAll();
    let services = await DockerServiceService.ls();

    DockerVolumeService.prune();
    DockerNetworkService.prune();
    
    users.forEach(async user => {
        const onProjects = await ProjectModel.findAll({ where: { scale: 1 }});
        const offProjects = await ProjectModel.findAll({ where: { scale: 0 }});
        const onDatabases = await DatabaseModel.findAll({ where: { scale: 1 }});
        const offDatabases = await DatabaseModel.findAll({ where: { scale: 0 }});

        for (let i = 0; i < onProjects.length; i++) {
            const plan = await PlanModel.findByPk(onProjects[i].planId);
            const image = await ImageModel.findByPk(onProjects[i].imageId);

            services = services.filter(service => service !== `${onProjects[i].name}_${image.name}`);
            user.balance = Number(user.balance) - (plan.price / 60);

            if (user.balance <= 0) {
                await DockerServiceService.scale(`${onProjects[i].name}_${image.name}`, 0);
                onProjects[i].freeze = true;
                p.scale = 0;
            };
            
            onProjects[i].save();
            user.save();
        };

        for (let i = 0; i < onDatabases.length; i++) {
            const plan = await PlanModel.findByPk(onDatabases[i].planId);
            
            user.balance = Number(user.balance) - (plan.price / 60);
            services = services.filter(service => service !== `${onDatabases[i].name}_db`);
            
            if (user.balance <= 0) {
                await DockerServiceService.scale(`${onDatabases[i].name}_db`, 0);
                onDatabases[i].freeze = true;
                onDatabases[i].scale = 0;
            };

            onDatabases[i].save();
            user.save();
        };
        
        for (let i = 0; i < offProjects.length; i++) {
            const plan = await PlanModel.findByPk(offProjects[i].planId);
            const image = await ImageModel.findByPk(offProjects[i].imageId);
            
            user.balance = Number(user.balance) - ((plan.price / 60) / 3);
            services = services.filter(service => service !== `${offProjects[i].name}_${image.name}`);

            if (user.balance <= 0 && (new Date(offProjects[i].updatedAt).getDate() - new Date().getDate() === -7)) {
                DockerServiceService.remove(`${offProjects[i].name}_${image.name}`);
                // cddnss.removeRecord(`${offProjects[i].name}.arianacloud.ir`);
                offProjects[i].destroy();
            } else if (user.balance >= 0 && offProjects[i].freeze === true && offProjects[i].scale === 0) {
                DockerServiceService.scale(`${offProjects[i].name}_${image.name}`, 1);
                offProjects[i].freeze = false;
                offProjects[i].scale = 1;
            };

            offProjects[i].save();
            user.save();
        };
        
        for (let i = 0; i < offDatabases.length; i++) {
            const plan = await PlanModel.findByPk(offDatabases[i].planId);
            
            user.balance = Number(user.balance) - ((plan.price / 60) / 3);
            services = services.filter(service => service !== `${offDatabases[i].name}_db`);

            if (user.balance <= 0 && (new Date(offDatabases[i].updatedAt).getDate() - new Date().getDate() === -7)) {
                DockerServiceService.remove(`${offDatabases[i].name}_db`);
                offDatabases[i].destroy();
            } else if (user.balance >= 0 && offDatabases[i].freeze === true && offDatabases[i].scale === 0) {
                DockerServiceService.scale(`${offDatabases[i].name}_db`, 1);
                offDatabases[i].freeze = false;
                offDatabases[i].scale = 1;
            };

            offDatabases[i].save();
            user.save();
        };

        for (let i = 0; i < services.length; i++) {
            DockerServiceService.remove(services[i]);
        };
        
        if (user.balance <= 100) {
            EmailService.sendMail(
                user.email,
                'Low balance - Ariana-Cloud Team',
                'شارژت ته کشید. قبل از اینکه ۷ روز بگذره بیا اکانتتو شارژ کن. بهت بگم که ما بعد از ۷ روز برنامه هایتو از رو سرور پاک میکنیم.'
            );
        };
    });
});

cron.schedule('*/10 * * * *', async () => {
    const expiredTokens = await TokenModel.findAll();

    expiredTokens.forEach(t => {
        // 60 * 60 * 1000 = 3600000; 1 hour later
        t.createdAt < new Date(Date.now() - 1800000) ? t.destroy() : '';
    });
});