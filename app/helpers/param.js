const m             = require('../config/message.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function dm(initialJSON, inputJSON, settings) {
    return new Promise(async function (resolve, reject) {
        if(inputJSON.message.length > 255) {
            inputJSON.message = inputJSON.message.substr(0, 255);
        }
        
        var param 	  	= { 
            t:      m.response.messaging.send,
            c:      parseInt(inputJSON.channelId),
            u:      parseInt(initialJSON.userChannelId),
            n:      typeof(initialJSON.displayName) === "undefined" ? "" : initialJSON.displayName,
            rn:     typeof(settings.d) === "undefined" ? "" : settings.d,
            ri:     typeof(settings.i) === "undefined" ? "" : settings.i,
            i:      typeof(initialJSON.avatar) === "undefined" ? "" : initialJSON.avatar,
            y:      typeof(initialJSON.accountType) === "undefined" ? "" : initialJSON.accountType,
            m:      inputJSON.message,
            d:      Date.now() 
        };

        resolve(param);
    });
}

module.exports = {
    dm
}