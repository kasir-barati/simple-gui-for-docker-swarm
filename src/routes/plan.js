const router = require('express').Router();

const PlanValidator = require('../controllers/validators/plan');
const PlanController = require('../controllers/middlewares/plan');
const Auth = require('../controllers/middlewares/auth');

router.route('/')
    .all(Auth.isAdmin)
    .get(PlanController.getPlans);

router.route('/create')
    .all(Auth.isAdmin)
    .post(PlanValidator.postCreatePlan, PlanController.postCreatePlan);

router.route('/edit/:id')
    .all(Auth.isAdmin)
    .get(PlanValidator.getEditPlan, PlanController.getEditPlan)
    .post(PlanValidator.postEditPlan, PlanController.postEditPlan);

router.route('/delete/:id')
    .all(Auth.isAdmin)
    .post(PlanValidator.postDeletePlan, PlanController.postDeletePlan);

module.exports = router;