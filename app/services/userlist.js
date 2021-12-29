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
            // Get Userlist
            channel.getFollowings(initialJSON.mysqlConnection,initialJSON.userChannelId, inputJSON.q).then(function(followings) {
                redmy.onlineChannels(initialJSON.redis).then(function(onlineChannels) {
                    redmy.lastOnlineChannels(initialJSON.redis).then(function(onlineChannelTimeStamps) {
                        var channelIds = [];

                        followings.forEach(function (following) {
                            channelIds.push(following.id);
                        });
                        setting.getDMSettings(initialJSON.mongoConnection, channelIds).then(function(settings) {
                            // Format Userlist
                            response.formatUserlist(followings, onlineChannels, onlineChannelTimeStamps, settings).then(function(followings) {
                                // Prepare Response
                                response.paginated(m.response.messaging.userlist, followings, true).then(function(message) {
                                    resolve(message);
                                }).catch(function(e) {
                                    reject(response.error(m.errorCode.userlist.list));
                                });
                            }); 
                        });
                        
                    });
                    
                });
                               
            });
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
            // Check if user is already banned
            validator.banValidation(initialJSON.redis, [initialJSON.userChannelId], inputJSON.channelId.toString()).then(function() {
                // Fetch Current List Count
                redmy.getListLength(initialJSON.redis, config.rkeys.banned + initialJSON.userChannelId).then(function(listLength) {
                    // Validate MaxLimit
                    validator.limitValidation(listLength, config.hlimit.banned).then(function() {
                        // Ban User
                        redmy.banUser(initialJSON.redis, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                            resolve(response.success(m.successCode.banUser.success));
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
        }).catch(function(e) {
            reject(response.error(m.errorCode.banUser.validation));
        });
    });
}

module.exports = {
    list,
    banUser
}