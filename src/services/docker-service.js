const Spawn = require('../utils/spawn');

class DockerServiceService {
    static async inspect (name) {
        try {
            const inspect = await Spawn.execute(`docker service inspect ${name} --format "{{json .}}"`);
            
            return { 'inspect': JSON.parse(inspect) };
        } catch (error) {
            return error;
        };
    };

    static async updateResource (name, plan) {
        try {
            await Spawn.execute(`docker service update --limit-memory=${plan.ram} --limit-cpu=${plan.cpu} ${name}`);
            const result = await Spawn.execute('echo $?');

            if (Number(result.split('\\')[0]) != 0) { return error } else { return };
        } catch (error) {
            return error;
        };
    };

    /**
     * add/update env key
     * @param {string} name service name
     * @param {string} env envKey=envValue
     */
    static async addEnv (name, env) {
        try {
            // docker service update --env-add TEST=123456
            let cmd = `docker service update --env-add ${env} ${name}`;

            await Spawn.execute(cmd);
            const result = await Spawn.execute('echo $?');

            if (Number(result.split('\\')[0]) != 0) { return error } else { return };
        } catch (error) {
            return error;
        };
    };

    /**
     * remove service env
     * @param {string} name service name
     * @param {string} envKey env key
     */
    static async removeEnv (name, envKey) {
        try {
            // --env-rm $envKey
            let cmd = `docker service update --env-rm ${envKey} ${name}`;

            await Spawn.execute(cmd);
            const result = await Spawn.execute('echo $?');

            if (Number(result.split('\\')[0]) != 0) { return error } else { return };
        } catch (error) { return error };
    };

    /**
     * return service logs
     * @param {string} name service name
     */
    static async logs (name) {
        try {
            console.log(name);
            let logs;
            if (name.includes('ghost')) {
                logs = await Spawn.execute(`docker service logs ${name}`);
                console.log(logs);
            } else {
                logs = await Spawn.executeAndReturnStderr(`docker service logs ${name}`);
                console.log(logs);
            };


            return { logs };
        } catch (error) { return error };
    };

    /**
     * remove service
     * @param {string} name docker service's name
     */
    static async remove (name) {
        try {
            await Spawn.execute(`docker service rm ${name}`);
            
            const result = await Spawn.execute('echo $?');

            if (Number(result.split('\\')[0]) != 0) { return error } else { return };
        } catch (error) { return error };
    };

    /**
     * change replicas. 0 means no container and 1 means create container
     * @param {string} name docker service's name
     * @param {int} scale 0 or 1, 0 = off & 1 = on
     */
    static async scale (name, scale) {
        try {
            await Spawn.execute(`docker service scale ${name}=${scale}`);

            const result = await Spawn.execute('echo $?');

            if (Number(result.split('\\')[0]) != 0) { return error } else { return };
        } catch (error) { return error };
    };

    /**
     * 
     * @param {string} name service name
     * @param {object} plan plan (database)
     * @param {number} publishedPort free port
     * @param {number} targetPort image port
     * @param {string} image imageName:version
     */
    static async create (name, plan, publishedPort, targetPort, image, volumeName) {
        try {
            await Spawn.execute(`docker service create --name ${name} --replicas 1 --publish published=${publishedPort},target=${targetPort} --limit-cpu ${plan.cpu} --limit-memory ${plan.ram} --mount 'type=volume,src=${volumeName}_nginx,dst=/usr/share/nginx/html' ${image}`);

            const result = await Spawn.execute('echo $?');

            if (Number(result.split('\\')[0]) != 0) { return error } else { return };
        } catch (error) { 
            this.remove(name);
            throw error 
        };
    };

    static async ls () {
        try {
            const services = await Spawn.execute('docker service ls --format {{.Name}}');

            return services.split('\n');
        } catch (error) { return error }
    };
};

module.exports = DockerServiceService;