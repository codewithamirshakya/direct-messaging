const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const redmy         = require('../helpers/redmy.js');
const channel       = require('../models/channel.js');
const setting       = require('../models/setting.js');


/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
*/
async function list(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validation
        validator.validation(inputJSON, validator.rules.ul).then(function() {

            // Limit Pagination
            var limit       = config.chat.limit; 
            var page        = parseInt(inputJSON.page);   
            var offset      = ( page - 1 ) * limit;

            // Get Userlist
            channel.getFollowers(initialJSON.mysqlConnection,initialJSON.userChannelId, inputJSON.q, limit, offset).then(function(followings) { 
                    // parse channel IDs from following object collection
                    var channelIds = [];
                    followings.forEach(function (following) {
                        channelIds.push(following.id);
                    });

                    redmy.getBanChannels(initialJSON.redis, initialJSON.userChannelId).then(function(bannedChannels) {
                        // Format Userlist
                        response.formatUserlist(followings, bannedChannels).then(function(followings) {
                            // Prepare Response
                            response.paginated(m.response.messaging.userlist, followings, true, initialJSON, inputJSON).then(function(message) {
                                resolve(message);
                            }).catch(function(e) {
                                reject(response.error(m.errorCode.userlist.list));
                            });
                        }).catch(function(e) {
                            reject(response.error(m.errorCode.userlist.list));
                        });
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.userlist.list));
                    });
                    
                }).catch(function(e) {
                    reject(response.error(m.errorCode.userlist.list));
                });               
            }).catch(function(e) {
                reject(response.error(m.errorCode.userlist.list));
            });
        });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function banUser(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.ub).then(function() {
            // Cannot ban Self
            if(initialJSON.userChannelId !== inputJSON.channelId) {
                // Check if user is already banned
                validator.banValidation(initialJSON.redis, [initialJSON.userChannelId], inputJSON.channelId.toString()).then(function() {
                    // Fetch Current List Count
                    redmy.getListLength(initialJSON.redis, config.rkeys.banned + initialJSON.userChannelId).then(function(listLength) {
                        // Validate MaxLimit
                        validator.limitValidation(listLength, config.hlimit.banned).then(function() {
                            // Ban User
                            redmy.banUser(initialJSON.redis, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                                // Prepare Response
                                response.typeMessage(m.successCode.banUser.success, {c: inputJSON.channelId}).then(function(message) {
                                    resolve(message);
                                });
                            }).catch(function(e) {
                                reject(response.error(m.errorCode.banUser.error));
                            });
                        }).catch(function(e) {
                            reject(response.error(m.errorCode.banUser.error));
                        });
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.banUser.error));
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.banUser.exist));
                });
            } else {
                reject(response.error(m.errorCode.banUser.validation));
            }
        }).catch(function(e) {
            reject(response.error(m.errorCode.banUser.validation));
        });
    });
}

module.exports = {
    list,
    banUser
}