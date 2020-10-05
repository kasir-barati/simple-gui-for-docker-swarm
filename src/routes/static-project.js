const router = require('express').Router();
const multipartMiddleware = require('connect-multiparty')();

const StaticProjectValidator = require('../controllers/validators/static-project');
const StaticProjectController = require('../controllers/middlewares/static-project');
const Auth = require('../controllers/middlewares/auth');

router.route('/')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectController.getStaticProjects);

router.route('/create')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectController.getCreateProject)
    .post(multipartMiddleware, StaticProjectValidator.postCreateProject, StaticProjectController.postCreateProject);

router.route('/inspect/:id')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectValidator.getInspectProject, StaticProjectController.getInspectProject);

router.route('/delete/:id')
    .all(Auth.userIsLoggedIn)
    .post(StaticProjectValidator.postDeleteProject, StaticProjectController.postDeleteProject);

router.route('/logs/:id')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectValidator.checkProjectId, StaticProjectController.getProjectLogs);

router.route('/stats/:id')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectValidator.checkProjectId, StaticProjectController.getProjectStats);

router.route('/exec/:id')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectValidator.checkProjectId, StaticProjectController.getProjectExec)
    .post(StaticProjectValidator.postProjectExec, StaticProjectController.postProjectExec);

router.route('/resources/:id')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectValidator.checkProjectId, StaticProjectController.getProjectResources)
    .post(StaticProjectValidator.checkProjectId, StaticProjectValidator.postProjectResources, StaticProjectController.postProjectResources);

router.route('/env/:id')
    .all(Auth.userIsLoggedIn)
    .get(StaticProjectValidator.checkProjectId, StaticProjectController.getProjectEnvs);

router.route('/env/add/:id')
    .all(Auth.userIsLoggedIn)
    .post(StaticProjectValidator.checkProjectId, StaticProjectValidator.postAddEnv, StaticProjectController.postAddEnv);

router.route('/env/remove/:id')
    .all(Auth.userIsLoggedIn)
    .post(StaticProjectValidator.checkProjectId, StaticProjectValidator.postRemoveEnv, StaticProjectController.postRemoveEnv);

module.exports = router;