const Spawn = require('../utils/spawn');

class DockerContainerService {
    /**
     * find container name
     * @param {string} serviceName docker service name
     * @return { string } service's container name
     */
    static async findContainerName (serviceName) {
        try {
            return await Spawn.execute(`docker container ls --format "{{.Names}}" | grep ${serviceName}`);
        } catch (error) { throw error };
    };

    /**
     * docker stats
     * @param {string} name container name
     * @return { string } stats docker stats that is not stream
     */
    static async stats (name) {
        try {
            let stats = await Spawn.execute(`docker stats --no-stream --format "{{.CPUPerc}}, {{.MemPerc}}" ${name}`);

            stats = stats.split(',');
            stats = { 
                'cpu': stats[0],
                'ram': stats[1]
            };

            return { stats };
        } catch (error) { throw error };
    };

    /**
     * exec command into the container
     * @param {string} command
     * @param {string} containerName container name
     * @return {string} command result
     */
    static async exec (containerName, command) {
        try {
            return await Spawn.execute(`docker exec ${containerName.trim()} ${command.trim()}`);
        } catch (error) { throw error };
    };

    /**
     * 
     * @param {string} containerName container name
     * @param {string} filePath path to directory that you wanna copy it
     */
    static async copy (containerName, filePath) {
        try {
            return await Spawn.execute(`docker cp ${filePath} ${containerName}:/usr/share/nginx/html`);
        } catch (error) { throw error };
    }
};

module.exports = DockerContainerService;