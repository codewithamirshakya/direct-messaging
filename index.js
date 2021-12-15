const os        = require('os');
const cluster   = require('cluster');
const app       = require('./app/route.js');
const config    = require('./app/config/default.js');
const numCPUs   = os.cpus().length;

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
    app.listen(config.server.port, (listenSocket) => {
        if (listenSocket) {
            console.log(`Worker ${process.pid} started`);
        }
    });

    process.on('SIGTERM', () => {
        dbConnection.end();
    })
}