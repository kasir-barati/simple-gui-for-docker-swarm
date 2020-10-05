const router = require('express').Router();

const PreparedProjectValidator = require('../controllers/validators/prepared-project');
const PreparedProjectController = require('../controllers/middlewares/prepared-project');
const Auth = require('../controllers/middlewares/auth');

router.route('/')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectController.getPreparedProjects);

router.route('/create')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectController.getCreateProject)
    .post(PreparedProjectValidator.postCreateProject, PreparedProjectController.postCreateProject);

router.route('/inspect/:id')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectValidator.getInspectProject, PreparedProjectController.getInspectProject);

router.route('/delete/:id')
    .all(Auth.userIsLoggedIn)
    .post(PreparedProjectValidator.postDeleteProject, PreparedProjectController.postDeleteProject);

router.route('/logs/:id')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectValidator.checkProjectId, PreparedProjectController.getProjectLogs);

router.route('/stats/:id')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectValidator.checkProjectId, PreparedProjectController.getProjectStats);

router.route('/exec/:id')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectValidator.checkProjectId, PreparedProjectController.getProjectExec)
    .post(PreparedProjectValidator.postProjectExec, PreparedProjectController.postProjectExec);

router.route('/resources/:id')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectValidator.checkProjectId, PreparedProjectController.getProjectResources)
    .post(PreparedProjectValidator.checkProjectId, PreparedProjectValidator.postProjectResources, PreparedProjectController.postProjectResources);

router.route('/env/:id')
    .all(Auth.userIsLoggedIn)
    .get(PreparedProjectValidator.checkProjectId, PreparedProjectController.getProjectEnvs);

router.route('/env/add/:id')
    .all(Auth.userIsLoggedIn)
    .post(PreparedProjectValidator.checkProjectId, PreparedProjectValidator.postAddEnv, PreparedProjectController.postAddEnv);

router.route('/env/remove/:id')
    .all(Auth.userIsLoggedIn)
    .post(PreparedProjectValidator.checkProjectId, PreparedProjectValidator.postRemoveEnv, PreparedProjectController.postRemoveEnv);

module.exports = router;