const config    = require('../config/default.js');
const response  = require('../helpers/response.js');
const sm        = require('../models/setting.js');
const em        = require('../models/emoji.js');
const util      = require('./redutil.js');
const utility   = require('./utility.js');

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

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 */
 async function channelOnline(client, userChannelId) {
    return new Promise(async function (resolve, reject) {
        try {
            // Store Online
            client.lpush(config.rkeys.online, userChannelId, function(err, items) {

            });

            // Remove Existing Timestamp
            client.zremrangebyscore(config.rkeys.lastOnline, userChannelId, userChannelId, function(err, items) {
                // Add New Timestamp
                client.zadd(config.rkeys.lastOnline, userChannelId, Date.now(), function(err, items) {
                    resolve();
                });
            })
        } catch(e) {
            resolve();
        }
           
        resolve();
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} userChannelId 
 */
async function channelOffline(client, userChannelId) {
    return new Promise(async function (resolve, reject) {
        try {
            client.lrem(config.rkeys.online, 1, userChannelId);

            resolve();
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 */
async function onlineChannels(client) {
    return new Promise(async function (resolve, reject) {
        try {
            client.lrange(config.rkeys.online, 0, -1,function(err, items) {
                if (err) {
                    console.log(err);
                }
                resolve(items);
            });

            
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 */
async function lastOnlineChannels(client) {
    return new Promise(async function (resolve, reject) {
        try {
            client.zrange(config.rkeys.lastOnline, 0, -1,'withscores',function(err,items) {
                if (err) {
                    console.log(err);
                }
                res = utility.prepareWithScoreResponse(items, 2);
                resolve(res);
            });

            
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function isChannelSubscriber(connection, channelId, subscriberId) {
    return new Promise(async function (resolve, reject) {
        em.isSubscriber(connection, channelId, subscriberId).then(function() {
            resolve();
        }).catch(function(e) {
            reject();
        });
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function getSubscribedEmojis(connection, channelId, subscriberId) {
    return new Promise(async function (resolve, reject) {
        em.subscribed(connection, channelId, subscriberId).then(function(cs) {
            response.formatEmojis(cs).then(function(emojis) {
                if(typeof emojis !== "undefined" ** emojis.length > 0) {
                    resolve(emojis);
                } else {
                    resolve(true);
                }
            });
        });
    });
}

module.exports = {
    getChannelSetting,
    getEmojis,
    getBanChannels,
    getListLength,
    banUser,
    channelOnline,
    channelOffline,
    onlineChannels,
    lastOnlineChannels,
    isChannelSubscriber,
    getSubscribedEmojis
}