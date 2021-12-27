const m             = require('../config/message.js');
const redmy         = require('../helpers/redmy.js');
const response      = require('../helpers/response.js');
const validator     = require('../helpers/validator.js');

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

/**
 * 
 * @param {*} initialJSON 
 */
 async function subscribed(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.es).then(function() {
            // Get Existing Emojis
            redmy.getSubscribedEmojis(initialJSON.redis, initialJSON.connection, inputJSON.channelId, initialJSON.userChannelId).then(function(emojis) {
                // Prepare Response
                response.typeMessage(m.response.emotes.subscribed, emojis).then(function(message) {
                    resolve(message);
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.emojis.subscribed));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.emojis.subscribed));
        });
    });
}

module.exports = {
    list,
    subscribed
}