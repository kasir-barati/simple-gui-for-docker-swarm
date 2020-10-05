const { spawn } = require('child_process');

class Spawn {
    static async execute (command) {
        try {
            const s = spawn(command, { shell: true });
            let error = '', result = '';

            return new Promise((resolve, reject) => {
                s.stderr.on('data', chunk => error += chunk.toString());
                s.stdout.on('data', chunk => result += chunk.toString());
                s.on('close', code => code === 0 ? resolve(result) : reject(error));
            });
        } catch (error) { throw error };
    };

    /**
     * return streams
     * @param {string} command command
     */
    static async executeAndReturnStderr (command) {
        try {
            const cmd = spawn(command, { shell: true });
            let result = '';

            return new Promise((resolve, reject) => {
                cmd.stderr.on('data', chunk => result += chunk.toString());
                cmd.on('close', code => code === 0 ? resolve(result) : reject(result));
            });
        } catch (error) { throw error };
    };
};

module.exports = Spawn;