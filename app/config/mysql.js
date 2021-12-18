var mysql       = require('mysql');
const config    = require('./default.js');

/**
 * 
 */
function connect() {
    return mysql.createPool({
        connectionLimit : config.mysql.connection,
        host            : config.mysql.host,
        port            : config.mysql.port,
        user            : config.mysql.user,
        password        : config.mysql.pass,
        database        : config.mysql.db
    });
}

module.exports = {
    connect
}