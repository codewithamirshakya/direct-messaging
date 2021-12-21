const m             = require('../config/message.js');
const redmy         = require('../helpers/redmy.js');
const response      = require('../helpers/response.js');

/**
 * 
 * @param {*} initialJSON 
 */
 async function list(initialJSON) {
    return new Promise(async function (resolve, reject) {
        // Get Existing Emojis
        redmy.getEmojis(initialJSON.redis, initialJSON.mysqlConnection, initialJSON.userChannelId).then(function(emojis) {
            // Prepare Response
            response.typeMessage(m.response.emotes.list, emojis).then(function(message) {
                resolve(message);
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.emojis.list));
        });
    });
}

module.exports = {
    list
}