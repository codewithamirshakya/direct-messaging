const config    = require('./default.js');
var MongoClient = require('mongodb').MongoClient;

/**
 * 
 */
async function connect() {
    return new Promise(async function (resolve, reject) {
        var username    = config.mongo.user;
        var password    = config.mongo.pass;
        var host        = config.mongo.host;
        var port        = config.mongo.port;
        var uri         = "mongodb://" + host + ":" + port;

        // Initialize connection once
        MongoClient.connect(uri, function(err, client) {
            if(err) throw err;
            
            resolve(client);
        });
    });
}

/**
 * 
 * @param {*} connection 
 */
function database(connection) {
    return connection.db(config.mongo.db);
}

module.exports = {
    connect,
    database
}