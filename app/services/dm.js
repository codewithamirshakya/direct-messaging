const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const redmy         = require('../helpers/redmy.js');
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
                     
            // Fetch History
            model.history(initialJSON.mongoConnection, initialJSON, inputJSON).then(function(result) {
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
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function channelList(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dcl).then(function() {    
            params = [
                {"$match" : {u: initialJSON.userChannelId.toString()}},
                {"$group" : {_id:"$c", rn: {$last:"$rn"}, n: {$last:"$n"},m:{$last:"$m"}, d:{$last:"$d"}, y:{$last:"$y"},i:{$last:"$i"}, id: {$last: "$_id"}}}
            ];  
            limit    = config.chat.limit;   
            skip     = (inputJSON.page - 1) * config.chat.limit; 

            // Fetch History
            model.aggregate(initialJSON.mongoConnection, params, limit, skip).then(function(result) {

                var res = [];
                try {
                    for(i=0; i< result.length; i++) {
                        res[i] = result[i];
                        res[i].c = result[i]._id;
                        delete res[i]._id;
                    }
                } catch(e) {

                }
                console.log(res);


                // Prepare Response
                response.paginated(m.response.messaging.history, res, true).then(function(message) {
                    resolve(message);
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.history));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.history));
        });
    });
}

module.exports = {
    messaging,
    history,
    channelList
}