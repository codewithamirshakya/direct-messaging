const util          = require('./utils/default.js');
const app           = require('uWebSockets.js').App();
const dm            = require('./sockets/dm.js');

/**
 * @description Routing
 */
 app.ws(
    '/message/*', 
    dm.socket
).get('/chat', (res, req) => {
    let file = util.readfile('chat.html');

    res.writeHeader('Content-Type', util.mimeType);
    res.end(file);
}).any('/*', (res, req) => {
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

module.exports = app;