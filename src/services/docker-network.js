const Spawn = require('../utils/spawn');

class DockerNetworkService {
    /**
     * Remove all unused networks.
     */
    static async prune () {
        try {
            await Spawn.execute(`docker network prune -f`);
            return;
        } catch (error) { throw error };
    };
};

module.exports = DockerNetworkService;