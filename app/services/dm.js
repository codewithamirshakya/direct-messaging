const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const redmy         = require('../helpers/redmy.js');
const mongo         = require('../helpers/mongo.js');
const param         = require('../helpers/param.js');
const pub           = require('../publishers/redis.js');
const model         = require('../models/dm.js');

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
            // Get Channel Settings
            redmy.getChannelSetting(initialJSON.redis, initialJSON.mysqlConnection, inputJSON.channelId).then(function(settings) {
                // Prepare Param
                param.dm(initialJSON, inputJSON, settings).then(function(params) {   
                    // Save Model                
                    model.save(initialJSON.mongoConnection, params).then(function(insertedId) {
                        // Prepare Response
                        response.typeMessage(m.response.messaging.send, params).then(function(message) {
                            // Publish Message
                            pub.publish(initialJSON, inputJSON.channelId, message).then(function() {
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
                console.log(e);
                reject(response.error(m.errorCode.messaging.validation));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function history(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dh).then(function() {     
            // Mongo Query Param
            mongo.message(inputJSON.channelId, initialJSON.userChannelId).then(function(q) {  
                // Limit Pagination
                var limit   = config.chat.limit;
                var skip    = (inputJSON.page - 1) * config.chat.limit;     

                // Fetch History
                model.history(initialJSON.mongoConnection, q, limit, skip).then(function(result) {
                    // Prepare Response
                    response.paginated(m.response.messaging.history, result, true).then(function(message) {
                        resolve(message);
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.history));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.history));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.history));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function messageList(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dcl).then(function() {
            // Mongo Query Param    
            mongo.list(initialJSON.userChannelId).then(function(q) {
                // Limit Pagination
                limit    = config.chat.limit;   
                skip     = (inputJSON.page - 1) * config.chat.limit; 

                // Fetch History
                model.aggregate(initialJSON.mongoConnection, q, limit, skip).then(function(result) {
                    // Format Message List
                    response.formatMessageList(result).then(function(list) {
                        // Prepare Response
                        response.paginated(m.response.messaging.messageList, list, true).then(function(message) {
                            resolve(message);
                        }).catch(function(e) {
                            reject(response.error(m.errorCode.messaging.messageList));
                        });
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.messageList));
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.messageList));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.messageList));
            });
            
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.messageList));
        });
    });
}

module.exports = {
    messaging,
    history,
    messageList
}