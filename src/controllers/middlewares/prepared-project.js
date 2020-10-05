const PreparedProjectService = require('../../services/prepared-project');

class PreparedProjectController {
    static async getPreparedProjects (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { id, email, balance, fullname } = req.session.user;
            const { preparedProjects, images } = await PreparedProjectService.getProjects(id);
            
            res.status(200).render('user/index-projects', {
                email, 
                images,
                balance,
                isAdmin,
                fullname,
                projectId: '',
                messages: messages,
                projectType: 'prepared',
                projects: preparedProjects,
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async getCreateProject (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            const { plans, images } = await PreparedProjectService.readPlansAndImages();

            res.render('user/create-project', {
                email,
                plans,
                images,
                isAdmin,
                balance,
                messages,
                fullname,
                projectId: '',
                errorMessages,
                githubClientId: '',
                projectType: 'prepared',
                pageTitle: 'Ariana-Cloud - Create CMS project'
            });
        } catch (error) { next(error) };
    };

    static async postCreateProject (req, res, next) {
        try {
            const { id } = req.session.user;
            const { planId, imageId, name } = req.body;

            await PreparedProjectService.createProject(id, planId, imageId, name);
            req.flash('messages', 'برنامه‌ای که می‌خواستی ساخته شد');
            res.redirect('/projects/prepared-projects');
        } catch (error) { next(error) };
    };

    static async getInspectProject (req, res, next) {
        try {
            const databaseEnv = [];
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            const { projectInspect, databaseInspect } = await PreparedProjectService.inspectProject(id);
            console.log(projectInspect);
            // projectInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
            //     projectEnv[env.split('=')[0]] = env.split('=')[1];
            // });
            if (databaseInspect.ID) {
                databaseInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
                    databaseEnv[env.split('=')[0]] = env.split('=')[1];
                });
            };

            res.render('user/inspect-project', {
                email, 
                isAdmin,
                balance,
                fullname,
                databaseEnv,
                projectId: id,
                projectInspect,
                databaseInspect,
                messages: messages,
                projectType: 'prepared',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async postDeleteProject (req, res, next) {
        try {
            const { id } = req.params;

            await PreparedProjectService.deleteProject(id);

            req.flash('messages', 'برنامه رو با موفقیت حذف کردیم. باهاش خداحافظی کردی دیگه؟ چونکه اصلا قابل برگشت نیست.');
            res.redirect('/projects/prepared-projects');
        } catch (error) { next(error) };
    };

    static async getProjectLogs (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            let { logs } = await PreparedProjectService.getProjectLogs(id);

            logs = logs ? logs.split('\n') : '';
            
            res.render('user/logs-project', {
                logs,
                email, 
                balance,
                isAdmin,
                fullname,
                projectId: id,
                messages: messages,
                projectType: 'prepared',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async getProjectStats (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { email, balance, fullname } = req.session.user;
            let { stats } = await PreparedProjectService.getProjectStats(id);

            res.render('user/stats-project', {
                stats,
                email, 
                balance,
                isAdmin,
                fullname,
                projectId: id,
                messages: messages,
                projectType: 'prepared',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async getProjectExec (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const commandResult = req.flash('commandResult');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            
            res.render('user/exec-project', {
                email, 
                isAdmin,
                balance,
                fullname,
                commandResult,
                projectId: id,
                messages: messages,
                projectType: 'prepared',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async postProjectExec (req, res, next) {
        try {
            const { id } = req.params;
            const { command } = req.body;
            const { commandResult } = await PreparedProjectService.execCommand(id, command);

            req.flash('commandResult', commandResult);
            res.redirect(`/projects/prepared-projects/exec/${id}`);
        } catch (error) { next(error) };
    };

    static async getProjectResources (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            const { plan } = await PreparedProjectService.getProjectPlan(id);
            const { plans } = await PreparedProjectService.getPlans();

            res.render('user/resources-project', {
                plan,
                plans,
                email,
                balance,
                isAdmin,
                fullname,
                projectId: id,
                messages: messages,
                projectType: 'prepared',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async postProjectResources (req, res, next) {
        try {
            const { id } = req.params;
            const { planId } = req.body;

            await PreparedProjectService.updateResources(id, planId);
            req.flash('messages', 'پلنت عوض شد دایه');
            res.redirect(`/projects/prepared-projects/resources/${id}`);
        } catch (error) { next(error) };
    };

    static async getProjectEnvs (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const databaseEnv = [], projectEnv = [];
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            const { projectInspect, databaseInspect } = await PreparedProjectService.inspectProject(id);

            if (projectInspect.Spec.TaskTemplate.ContainerSpec.Env) {
                projectInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
                    projectEnv[env.split('=')[0]] = env.split('=')[1];
                });
            };
            if (databaseInspect.Spec.TaskTemplate.ContainerSpec.Env) {
                databaseInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
                    databaseEnv[env.split('=')[0]] = env.split('=')[1];
                });
            };

            res.render('user/env-project', {
                email,
                isAdmin,
                balance,
                fullname,
                projectEnv,
                databaseEnv,
                projectId: id,
                messages: messages,
                projectType: 'prepared',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - CMS projects'
            });
        } catch (error) { next(error) };
    };

    static async postAddEnv (req, res, next) {
        try {
            const { id } = req.params;
            const { envKey, envValue } = req.body;

            await PreparedProjectService.addEnv(id, envKey, envValue);

            req.flash('messages', 'متغیره اضافه شد');
            res.redirect(`/projects/prepared-projects/env/${id}`);
        } catch (error) { next(error) };
    };

    static async postRemoveEnv (req, res, next) {
        try {
            const { id } = req.params;
            const { envKey } = req.body;
            
            await PreparedProjectService.removeEnv(id, envKey);

            req.flash('messages', 'متغیره حذف شد');
            res.redirect(`/projects/prepared-projects/env/${id}`);
        } catch (error) { next(error) };
    };
};

module.exports = PreparedProjectController;