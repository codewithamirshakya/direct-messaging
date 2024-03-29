const os        = require('os');
const cluster   = require('cluster');
const redis     = require("redis");
const app       = require('./app/route.js');
const config    = require('./app/config/default.js');
const mongo     = require('./app/config/mongo.js');
const mysql     = require('./app/config/mysql.js');
const redmy     = require('./app/helpers/redmy.js');

const numCPUs           = os.cpus().length;
const dbConnection      = mysql.connect();
const client            = redis.createClient(config.redis);
const redisSub          = redis.createClient(config.redisSub);
const redisPub          = redis.createClient(config.redisPub);

// Redis Adapter
redisSub.on("message", function(channel, message) {
    app.publish(channel, message);
});

/***
 * Worker Thread
 */
 if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    redmy.deleteOnlineChannels(client);
    redmy.deleteActiveChannels(client);

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
    app.setMysql(dbConnection);

    mongo.connect().then(function(connection) {
        app.setMongo(mongo.database(connection));
    });

    app.listen(config.server.port, (listenSocket) => {
        if (listenSocket) {
            console.log(`Worker ${process.pid} started`);
        }
    });

    process.on('SIGTERM', () => {
        dbConnection.end();
    })
}