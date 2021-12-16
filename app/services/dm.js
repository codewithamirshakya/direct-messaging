const m             = require('../config/message.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const param         = require('../helpers/param.js');
const pub           = require('../publishers/redis.js');

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
                // Prepare Response
                response.typeMessage(m.response.messaging.send, params).then(function(message) {
                    // Publish Message
                    pub.publish(initialJSON, message).then(function() {
                        resolve(true);
                    }).catch(function(e) {
                        resolve(true);
                    });
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.validation));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

module.exports = {
    messaging
}