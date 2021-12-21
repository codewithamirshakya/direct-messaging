const app           = require('uWebSockets.js').App();
const dm            = require('./sockets/dm.js');

/**
 * @description Routing
 */
 app.ws(
    '/message/*', 
    dm.socket
).any('/*', (res, req) => {
    /* Let's deny all Http */
    res.end('Nothing to see here!');
});

app.setRedis = function(client) {
    dm.setRedis(client);
}

app.setRedisSub = function(sub) {
    dm.setRedisSub(sub);
}

app.setRedisPub = function(pub) {
    dm.setRedisPub(pub);
}

app.setMongo = function(conn) {
    dm.setMongo(conn);
}

app.setMysql = function(conn) {
    dm.setMysql(conn);
}

module.exports = app;