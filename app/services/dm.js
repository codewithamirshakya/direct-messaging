const m             = require('../config/message.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');

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

            // publish message 
            ws.publish(initialJSON.routingKey, inputJSON.message);
            // Prepare Response
            response.typeMessage(m.response.messaging.send, [inputJSON.message]).then(function(message) {
                resolve(message);
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