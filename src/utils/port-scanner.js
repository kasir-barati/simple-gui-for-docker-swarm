const Spawn = require('./spawn');

class PortScanner {
    static async inUsePorts () {
        try {
            const result = await Spawn.execute("ss -ntl | awk '{print $4}' | cut -d':' -f 2 | grep ^[1-9] | sort -n");
            
            return { 'ports': result.split('\n') };
        } catch (error) { throw error };
    };

    static async unUsePort (start, end) {
        try {
            const { ports } = await this.inUsePorts();
            const portsAboveTheStart = ports.filter(p => {
                if (p >= start && p <= end) return p;
            });

            for (let port = start; port < end; port++) {
                if (portsAboveTheStart.includes(String(port))) continue;
                else return port;
            };
        } catch (error) { throw error };
    };
};

module.exports = PortScanner;