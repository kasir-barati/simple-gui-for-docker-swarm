const PlanModel = require('../models/plan');

class PlanService {
    /**
     * Read all plans fron database
     * @return {array} plans
     */
    static async readPlans () {
        try {
            const plans = await PlanModel.findAll();

            return { plans };
        } catch (error) { throw error };
    };

    /**
     * create plan
     * @param {String} name plan name
     * @param {Boolean} available plan available
     * @param {Number} price plan Price per half hour
     * @param {Number} volume plan storage space
     * @param {Number} ram plan RAM (shared not dedicate)
     * @param {Number} cpu plan CPU (shared not dedicate)
     * @param {String} description plan description, maximum length is 200 character
     */
    static async createPlan (name, available, price, volume, ram, cpu, description) {
        try {
            await PlanModel.create({
                name, available, price, volume, ram, cpu, description
            });

            return;
        } catch (error) { throw error };
    };

    /**
     * read plan data from database
     * @param {UUID} id plan ID
     * @return {object} plan
     */
    static async readPlan (id) {
        try {
            const plan = await PlanModel.findByPk(id);

            return { plan };
        } catch (error) { throw error };
    };

    /**
     * update plan
     * @param {UUID} id plan ID
     * @param {string} name plan name
     * @param {boolean} available plan available
     * @param {float} price plan price
     * @param {float} volume plan storage
     * @param {string} ram plan ram
     * @param {float} cpu plan cores number
     * @param {string} description describe the plan
     */
    static async updatePlan (id, name,  available, price, volume, ram, cpu, description) {
        try {
            const plan = await PlanModel.findByPk(id);

            await plan.update({name,  available, price, volume, ram, cpu, description});

            return;
        } catch (error) { throw error };
    };

    /**
     * delete (row) a record from plans
     * @param {UUID} id plan ID
     */
    static async deletePlan (id) {
        try {
            const plan = await PlanModel.findByPk(id);

            await plan.destroy();

            return;
        } catch (error) { throw error };
    };

    static async getPlan (id) {
        try {
            const plan = await PlanModel.findByPk(id);

            return { plan };
        } catch (error) { throw error };
    };
};

module.exports = PlanService;