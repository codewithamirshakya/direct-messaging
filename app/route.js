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

module.exports = app;