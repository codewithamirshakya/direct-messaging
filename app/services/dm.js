const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
 async function messaging(initialJSON, inputJSON, ws) {
    let senderId = initialJSON.channelId;      
    let receiverId = initialJSON.userChannelId;   

    let messagingKey = config.exchange.messaging + "_" + senderId + "_" + receiverId;

    if(senderId > receiverId) {
        messagingKey = config.exchange.messaging + "_" + receiverId + "_" + senderId;
    } 

    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dm).then(function() {
            console.log(inputJSON,messagingKey);
            ws.publish(messagingKey, inputJSON.message);
            // Prepare Response
            response.typeMessage(m.response.messaging.send, [inputJSON.message]).then(function(message) {
                resolve(message);
            });
            
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

module.exports = {
    messaging
}