const os        = require('os');
const cluster   = require('cluster');
const redis     = require("redis");
const app       = require('./app/route.js');
const config    = require('./app/config/default.js');

const numCPUs       = os.cpus().length;
const client        = redis.createClient(config.redis);
const redisSub      = redis.createClient(config.redisSub);
const redisPub      = redis.createClient(config.redisPub);

// Redis Adapter
redisSub.on("message", function(channel, message) {
    app.publish(channel, message);
});

/***
 * Worker Thread
 */
 if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    app.setRedis(client);
    app.setRedisSub(redisSub);
    app.setRedisPub(redisPub);

    app.listen(config.server.port, (listenSocket) => {
        if (listenSocket) {
            console.log(`Worker ${process.pid} started`);
        }
    });

    process.on('SIGTERM', () => {
        dbConnection.end();
    })
}