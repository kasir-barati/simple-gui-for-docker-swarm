const Spawn = require('../utils/spawn');

class DockerVolumeService {
    /**
     * create volume
     * @param {string} name volume name
     * @param {number} size volume size
     */
    static async create (name, size) {
        try {
            const volume = await Spawn.execute(`docker volume create ${name}`);

            return { volume };
        } catch (error) {
            await this.remove(name);
            throw error 
        };
    };

    /**
     * remove all unused volume
     */
    static async prune () {
        try {
            const volume = await Spawn.execute(`docker volume prune -f`);

            return { volume };
        } catch (error) { throw error };
    };

    /**
     * remove volume forcefuly
     * @param {string []? string} name volume name
     */
    static async remove (name) {
        try {
            await Spawn.execute(`docker volume rm -f ${name}`);
        } catch (error) { throw error };
    }
};

module.exports = DockerVolumeService;