const config    = require('../config/default.js');
const response  = require('../helpers/response.js');
const sm        = require('../models/setting.js');
const em        = require('../models/emoji.js');
const util      = require('./redutil.js');

/**
 * 
 * @param {*} client 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function getChannelSetting(client, connection, channelId) {
    return new Promise(async function (resolve, reject) {
        client.get(config.rkeys.settings + channelId, function(err, channelSetting) {
            if(channelSetting == null || err) {
                sm.get(connection, channelId).then(function(cs) {
                    response.formatSettings(cs).then(function(channelSetting) {
                        if(typeof channelSetting !== "undefined") {
                            client.set(config.rkeys.settings + channelId, JSON.stringify(channelSetting), 'EX', config.expire.settings);
                            
                            resolve(channelSetting);
                        } else {
                            resolve();
                        }
                    });
                });
            } else {
                try {
                    setting = JSON.parse(channelSetting);
                    
                    resolve(setting);
                } catch(e) {
                    console.log(e);
                    resolve();
                }
            }
        });   
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function getEmojis(client, connection, channelId) {
    return new Promise(async function (resolve, reject) {
        client.get(config.rkeys.emojis + channelId, function(err, emojis) {
            if(emojis == null || err) {
                em.get(connection, channelId).then(function(cs) {
                    response.formatEmojis(cs).then(function(emojis) {
                        if(typeof emojis !== "undefined") {
                            client.set(config.rkeys.emojis + channelId, JSON.stringify(emojis), 'EX', config.expire.emojis);
                            
                            resolve(emojis);
                        } else {
                            resolve(true);
                        }
                    });
                });
            } else {
                try {
                    emojis = JSON.parse(emojis);
                    resolve(emojis);
                } catch(e) {
                    resolve();
                }
            }
        });   
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 */
 async function getBanChannels(client, channels) {
    return new Promise(async function (resolve, reject) {
        resolve(util.multirange(client, channels, config.rkeys.banned, 0, -1));
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} lkey 
 * @returns 
 */
 async function getListLength(client, lkey) {
    return new Promise(async function (resolve, reject) {
        client.llen(lkey, function(err, length) {
            resolve(length);
        });
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 * @param {*} banChannelId 
 */
async function banUser(client, channelId, banChannelId) {
    return new Promise(async function (resolve, reject) {
        client.lpush(config.rkeys.banned + channelId, banChannelId); 
        client.lrem(config.rkeys.moderators + channelId, 1, banChannelId);

        resolve();
    });
}

module.exports = {
    getChannelSetting,
    getEmojis,
    getBanChannels,
    getListLength,
    banUser
}