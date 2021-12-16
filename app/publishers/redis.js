/**
 * 
 * @param {*} initialJSON 
 * @param {*} message 
 * @param {*} notify 
 * @param {*} list 
 */
 async function publish(initialJSON, message, notify) {
    return new Promise(async function (resolve, reject) {
        try {
            var routingKey = initialJSON.routingKey;

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