const { githubClientId } = require('../../config');
const StaticProjectService = require('../../services/static-project');

class StaticProjectController {
    static async getStaticProjects (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { id, email, balance, fullname } = req.session.user;
            const { staticProjects, images } = await StaticProjectService.getProjects(id, isAdmin);
            
            res.status(200).render('user/index-projects', {
                email,
                images,
                isAdmin,
                balance,
                fullname,
                projectId: '',
                messages: messages,
                projectType: 'static',
                projects: staticProjects,
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects'
            });
        } catch (error) { next(error) };
    };

    static async getCreateProject (req, res, next) {
        try {
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            const { plans } = await StaticProjectService.readPlansAndImages();

            res.render('user/create-project', {
                email, 
                plans,
                balance,
                isAdmin,
                fullname,
                messages,
                projectId: '',
                errorMessages,
                githubClientId,
                projectType: 'static',
                pageTitle: 'Ariana-Cloud - Create Static project'
            });
        } catch (error) { next(error) };
    };

    static async postCreateProject (req, res, next) {
        try {
            const { id } = req.session.user;
            const { projectFile } = req.files;
            const { planId, name } = req.body;

            await StaticProjectService.createProject(id, name, planId, projectFile);
            req.flash('messages', 'برنامه‌ای که می‌خواستی ساخته شد');
            res.redirect('/projects/static-projects');
        } catch (error) { next(error) };
    };

    static async getInspectProject (req, res, next) {
        try {
            const projectEnv = [];
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            const { projectInspect } = await StaticProjectService.inspectProject(id);

            projectInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
                projectEnv[env.split('=')[0]] = env.split('=')[1];
            });

            res.render('user/inspect-project', {
                email, 
                isAdmin,
                balance,
                fullname,
                projectEnv,
                projectId: id,
                projectInspect,
                messages: messages,
                projectType: 'static',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects'
            });
        } catch (error) { next(error) };
    };

    static async postDeleteProject (req, res, next) {
        try {
            const { id } = req.params;

            await StaticProjectService.deleteProject(id);

            req.flash('messages', 'برنامه رو با موفقیت حذف کردیم. باهاش خداحافظی کردی دیگه؟ چونکه اصلا قابل برگشت نیست.');
            res.redirect('/projects/static-projects');
        } catch (error) { next(error) };
    };

    static async getProjectLogs (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            let { logs } = await StaticProjectService.getProjectLogs(id);

            logs = logs.split('\n');
            
            res.render('user/logs-project', {
                logs,
                email,
                isAdmin,
                balance,
                fullname,
                projectId: id,
                messages: messages,
                projectType: 'static',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects'
            });
        } catch (error) { next(error) };
    };

    static async getProjectStats (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            let { stats } = await StaticProjectService.getProjectStats(id);
            
            res.render('user/stats-project', {
                stats,
                email, 
                isAdmin,
                balance,
                fullname,
                projectId: id,
                messages: messages,
                projectType: 'static',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects'
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
                projectId: id,
                commandResult,
                messages: messages,
                projectType: 'static',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects exec'
            });
        } catch (error) { next(error) };
    };

    static async postProjectExec (req, res, next) {
        try {
            const { id } = req.params;
            const { command } = req.body;
            const { commandResult } = await StaticProjectService.execCommand(id, command);

            req.flash('commandResult', commandResult);
            res.redirect(`/projects/static-projects/exec/${id}`);
        } catch (error) { next(error) };
    };

    static async getProjectResources (req, res, next) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            const { plan } = await StaticProjectService.getProjectPlan(id);
            const { plans } = await StaticProjectService.getPlans();

            res.render('user/resources-project', {
                plan,
                plans,
                email,
                isAdmin,
                balance,
                fullname,
                projectId: id,
                messages: messages,
                projectType: 'static',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects'
            });
        } catch (error) { next(error) };
    };

    static async postProjectResources (req, res, next) {
        try {
            const { id } = req.params;
            const { id: planId } = req.body;

            await StaticProjectService.updateResources(id, planId);
            req.flash('messages', 'پلنت عوض شد دایه');
            res.redirect(`/projects/static-projects/resources/${id}`);
        } catch (error) { next(error) };
    };

    static async getProjectEnvs (req, res, next) {
        try {
            const projectEnv = [];
            const { id } = req.params;
            const { isAdmin } = req.session;
            const messages = req.flash('messages');
            const errorMessages = req.flash('errorMessages');
            const { fullname, email, balance } = req.session.user;
            const { projectInspect } = await StaticProjectService.inspectProject(id);

            projectInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
                projectEnv[env.split('=')[0]] = env.split('=')[1];
            });

            res.render('user/env-project', {
                email,
                isAdmin,
                balance,
                fullname,
                projectEnv,
                projectId: id,
                messages: messages,
                projectType: 'static',
                errorMessages: errorMessages,
                pageTitle: 'Ariana-Cloud - Static projects env'
            });
        } catch (error) { next(error) };
    };

    static async postAddEnv (req, res, next) {
        try {
            const { id } = req.params;
            const { envKey, envValue } = req.body;

            await StaticProjectService.addEnv(id, envKey, envValue);

            req.flash('messages', 'متغیره اضافه شد');
            res.redirect(`/projects/static-projects/env/${id}`);
        } catch (error) { next(error) };
    };

    static async postRemoveEnv (req, res, next) {
        try {
            const { id } = req.params;
            const { envKey } = req.body;
            
            await StaticProjectService.removeEnv(id, envKey);

            req.flash('messages', 'متغیره حذف شد');
            res.redirect(`/projects/static-projects/env/${id}`);
        } catch (error) { next(error) };
    };
};

module.exports = StaticProjectController;