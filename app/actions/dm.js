const m         = require('../config/message.js');
const dm        = require('../services/dm.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @param {*} ws 
 * @returns 
 */
 async function action(initialJSON, inputJSON, ws) 
 {
    return new Promise(async function (resolve, reject) {
        switch(inputJSON.type) {
            // Initial Ticker Settomg
            case m.type.messaging.send:
                // Message Handler
                dm.messaging(initialJSON, inputJSON, ws).then(function(message) {
                    resolve(message);
                });
                break;
        }
    });
}

module.exports = {
    action
}