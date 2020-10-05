const PlanModel = require('../../models/plan');
const ImageModel = require('../../models/image');
const Validator = require('../../utils/validator');
const ProjectModel = require('../../models/project');
const StaticProjectService = require('../../services/static-project');

class StaticProjectValidator {
    static async postCreateProject (req, res, next) {
        try {
            const { planId, name } = req.body;
            const { projectFile } = req.files;
            const errorMessages = [];

            !await PlanModel.findByPk(planId) ? errorMessages.push('هوی، همچی پلنی نداشتیمو!') : '';
            if (projectFile.name) {
                !Validator.isZip(projectFile.type) ? errorMessages.push('فرمت فایل باس zip باشه.') : '';
            } else if (projectFile.length > 0) {
                errorMessages.push('فقط یه فایل میتونی آپلود کنی');
            };
            if (Validator.isValidForProjectName(name)) {
                await ProjectModel.findOne({ where: { name }}) ? errorMessages.push('یه اسم دیگه رو پروژت بزار. این اسم قبلا گرفته شده') : '';
            } else {
                errorMessages.push('یه اسم دیگه رو پروژت بزار. این اسم رو نمیتونم به عنوان ساب دومین ثبت بکنم. چونکه یه URL نمیتونه این شکلی باشه');
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects/create');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async getInspectProject (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.params;
            const { id: userId } = req.session.user;
            const project = await ProjectModel.findByPk(id);
            
            if (project) {
                project.userId !== userId ? errorMessages.push('داداشه این پروژه باس تو نیستو.') : '';
            } else {
                errorMessages.push('داداشه همچین پروژه ای نداریم.');
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postDeleteProject (req, res, next) {
        try {
            const { id } = req.params;
            const errorMessages = [];
            
            if (!await ProjectModel.findByPk(id)) {
                errorMessages.push('همچین پروژه ای با همچین ID ای نداشتیمو');
            };

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async checkProjectId (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.params;

            !await ProjectModel.findByPk(id) ? errorMessages.push('داداشه به یه چیزی ور رفتی. به همین خاطر این ور به مشکل خوردی') : '';
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postProjectExec (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.params;
            const { command } = req.body;

            !await ProjectModel.findByPk(id) ? errorMessages.push('داداشه به یه چیزی ور رفتی. به همین خاطر این ور به مشکل خوردی') : '';
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postProjectResources (req, res, next) {
        try {
            const errorMessages = [];
            const { id } = req.body;

            !await PlanModel.findByPk(id) ? errorMessages.push('داداشه همچی پلنی نداریم.') : '';
            
            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postAddEnv (req, res, next) {
        try {
            const errorMessages = [];
            const { envKey, envValue } = req.body;

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect('/projects/static-projects');
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async postRemoveEnv (req, res, next) {
        try {
            const projectEnv = [];
            const errorMessages = [];
            const { id } = req.params;
            const { envKey } = req.body;
            const { projectInspect } = await StaticProjectService.inspectProject(id);

            projectInspect.Spec.TaskTemplate.ContainerSpec.Env.forEach(env => {
                projectEnv.push(env.split('=')[0]);
            });
            !projectEnv.includes(envKey) ? errorMessages.push('همچین متغیری نداریم که حذفش بکنیم.') : '';

            if (errorMessages.length > 0) {
                console.error(errorMessages);
                req.flash('errorMessages', errorMessages);
                res.redirect(`/projects/static-projects/env/${id}`);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };

    static async checkGithubTokens (req, res, next) {
        try {
            const { name } = req.params;
            const { githubAccessToken, githubRefreshToken } = req.body;
            const errorMessages = [];

            if (!Validator.isDockerName(name) || name === 'all') {
                errorMessages.push('name is not valid.');
            } else {
                !await ProjectModel.findByPk(name) ? errorMessages.push('name does not exist.') : '';
            };
            !githubAccessToken ? errorMessages.push('Github access token is not valid.') : '';
            !githubRefreshToken ? errorMessages.push('Github refresh token is not valid.') : '';

            if (errorMessages.length) {
                const error = new Error();
                error.statusCode = 422;
                error.message = error.message || 'Validation error';
                error.messages = errorMessages;
                next(error);
            } else {
                next();
            };
        } catch (error) { next(error) };
    };
};

module.exports = StaticProjectValidator;