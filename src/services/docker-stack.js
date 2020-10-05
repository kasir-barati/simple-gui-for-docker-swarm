const path = require('path');
const crypto = require('crypto');
const { promises: fs } = require('fs');

const PortScanner = require('../utils/port-scanner');
const Spawn = require('../utils/spawn');

class DockerStackService {
    static async deployPreparedProjects(name, imageName, plan) {
        try {
            const ymlPath = ymlFilePath(imageName);
            const newymlPath = path.join(__dirname, 'docker-compose.yml');
            const projectPort = await PortScanner.unUsePort(~~(Math.random() * (11000 - 8000 + 1)) + 8000, 11000);

            let yaml = await fs.readFile(ymlPath);
            yaml = yaml.toString();
            yaml = yaml.replace(/serviceName/g, name);
            if (imageName !== 'ghost') {
                yaml = yaml.replace(/mysqlPublishedPort/g, await PortScanner.unUsePort(~~(Math.random() * (35000 - 33000 + 1)) + 33000, 35000));
                yaml = yaml.replace(/dbRootPassword/g, crypto.randomBytes(10).toString('hex'));
                yaml = yaml.replace(/dbPassword/g, crypto.randomBytes(10).toString('hex'));
            };
            yaml = yaml.replace(/publishedPort/g, projectPort);
            yaml = yaml.replace(/"cpu"/g, `'${plan.cpu}'`);
            yaml = yaml.replace(/ram/g, plan.ram);

            await fs.writeFile(newymlPath, yaml);
            await Spawn.execute(`docker stack deploy -c ${newymlPath} ${name}`);
            return { projectPort };
        } catch (error) { 
            this.removeStack(name);
            throw error 
        };
    };

    /**
     * deploy static project
     * @param {string} name project name
     * @param {Object} plan plan object (database)
     */
    // static async deployStaticProjects(name, plan) {
    //     try {
    //         const zip = new StreamZip({
    //             file: filePath,
    //             storeEntries: true
    //         });
    //         const ymlPath = ymlFilePath('static');
    //         const newymlPath = path.join(__dirname, 'docker-compose.yml');
    //         const projectPort = await PortScanner.unUsePort(~~(Math.random() * (11000 - 8000 + 1)) + 8000, 11000);

    //         /**
    //          * extract file
    //          */
    //         zip.on('error', error => { throw error });
    //         zip.on('ready', () => {
    //             await fs.mkdir(`${name}-extracted`);
    //             zip.extract(null, `./${name}-extracted`, (error, count) => {
    //                 console.log(error ? 'Extract error' : `Extracted ${count} entries`);
    //                 zip.close(error => console.error(error));
    //                 await fs.unlink(filePath);
    //             });
    //         });

    //         let yaml = await fs.readFile(ymlPath);
    //         yaml = yaml.toString();
    //         yaml = yaml.replace('publishedPort', projectPort);
    //         yaml = yaml.replace(/"cpu"/g, `'${plan.cpu}'`);
    //         yaml = yaml.replace(/ram/g, plan.ram);

    //         await fs.writeFile(newymlPath, yaml);
    //         await Spawn.execute(`docker stack deploy -c ${newymlPath} ${name}`);
    //         return { projectPort };
    //     } catch (error) { throw error };
    // };

    /**
     * remove project and its database using its name
     * @param {string} name project name
     */
    static async removeStack(name) {
        try {
            await Spawn.execute(`docker stack rm ${name}`);
            const result = await Spawn.execute('echo $?');

            return { result: Number(result.split('\\')[0]) };
        } catch (error) { throw error };
    };
};

module.exports = DockerStackService;

function ymlFilePath(imageName) {
    let filePath;

    switch (imageName) {
        case 'wordpress':
            filePath = path.join(__dirname, '..', '..', 'yamls', 'wordpress.yml');
            break;
        case 'drupal':
            filePath = path.join(__dirname, '..', '..', 'yamls', 'drupal.yml');
            break;
        case 'joomla':
            filePath = path.join(__dirname, '..', '..', 'yamls', 'joomla.yml');
            break;
        case 'ghost':
            filePath = path.join(__dirname, '..', '..', 'yamls', 'ghost.yml');
            break;
        case 'static':
            filePath = path.join(__dirname, '..', '..', 'yamls', 'static.yml');
            break;
    };

    return filePath;
};

// ('postgres'): Target = '/var/lib/postgres/data'; TargetPort = 5432; Env = [ `POSTGRES_ROOT_PASSWORD=${crypto.randomBytes(10).toString('hex')}` ]; Command = [ '/bin/bash' ];
// ('mssql'): Target = '/opt/mssql-tools/bin/sqlcmd'; TargetPort = null; Env = [ `MSSQL_ROOT_PASSWORD=${crypto.randomBytes(10).toString('hex')}` ]; Command = [ '/bin/bash' ];
// ('mongodb'): Target = '/data/db'; TargetPort = 27017; Env = [ `MONGODB_ROOT_PASSWORD=${crypto.randomBytes(10).toString('hex')}` ]; Command = [ '/bin/bash' ];
// ('nginx'): Target = '/usr/share/nginx/html/'; TargetPort = 80; Env = [ 'NGINX_HOST', 'NGINX_PORT' ]; Args = [ 'google.com', '80' ]; Command = [ "nginx-g 'daemon off;'" ];