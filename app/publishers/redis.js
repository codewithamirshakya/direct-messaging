const util          = require('../utils/default.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} message 
 * @param {*} notify 
 * @param {*} list 
 */
 async function publish(initialJSON, channelId, message, notify) {
    return new Promise(async function (resolve, reject) {
        try {
            var routingKey = util.pubSubKey(channelId);

            // Message
            if(typeof message !== "undefined") {
                initialJSON.redisPub.publish(routingKey, message);
            }
    
            // Alert
            if(typeof notify !== "undefined" && notify.length > 0) {
                initialJSON.redisPub.publish(routingKey, notify);
            }

            resolve(true);
        } catch(e) {
            reject(true);
        }
    });
}

module.exports = {
    publish
}