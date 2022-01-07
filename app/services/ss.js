const mongo         = require('../helpers/mongo.js');
const model         = require('../models/dm.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
 async function deliveredStatus(mongoConnection, userChannelId) {
    return new Promise(async function (resolve, reject) {
        // Mongo Query Param
        mongo.deliveredStatus(userChannelId).then(function(q) { 
            // Update seen status
            model.update(mongoConnection, q, { $set: { dv: true } }).then(function() {
                resolve();
            }).catch(function(e) {
                reject(e);
            });
        }).catch(function(e) {
            reject(e);
        });
    });
}

module.exports = {
    deliveredStatus
}