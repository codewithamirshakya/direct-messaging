const m             = require('../config/message.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const param         = require('../helpers/param.js');
const pub           = require('../publishers/redis.js');
const model         = require('../models/dm.js');
const util          = require('../config/default.js');


/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
 async function messaging(initialJSON, inputJSON, ws) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dm).then(function() {
            // Prepare Param
            param.dm(initialJSON, inputJSON).then(function(params) {           
                // Save Model                
                model.save(initialJSON.mongoConnection, params).then(function() {
                    // Prepare Response
                    response.typeMessage(m.response.messaging.send, params).then(function(message) {
                        // Publish Message
                        pub.publish(initialJSON, message).then(function() {
                            resolve(true);
                        }).catch(function(e) {
                            resolve(true);
                        });

                        resolve(message);
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.save));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.validation));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

async function history(initialJSON, inputJSON, ws) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.his).then(function() {
            params = {
                $or: [{
                    c: inputJSON.senderId,
                    u: inputJSON.receiverId.toString()
                }, {
                    u: inputJSON.receiverId.toString(),
                    c: inputJSON.senderId
                }]
            };

            limit = inputJSON.page * util.chat.limit;
            skip = (inputJSON.page - 1) * limit;       

            model.history(initialJSON.mongoConnection, params, skip, limit).then(function(result) {
                // Prepare Response
                response.paginated(m.response.messaging.history, result, true).then(function(message) {
                    resolve(message);
                });
            });
            
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

module.exports = {
    messaging,
    history
}