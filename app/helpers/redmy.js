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
            client.zrange(config.rkeys.lastOnline, 0, -1, 'withscores', function(err,items) {
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
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
 async function conStatus(client, channelId, userChannelId, allowChat) {
    return new Promise(async function (resolve, reject) {
        try {
            var key = config.rkeys.allow + channelId + '_' + userChannelId;
            client.set(key, allowChat, 'EX', config.expire.active);

            resolve();
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function getAllowStatus(client, channelId, userChannelId) {
    return new Promise(async function (resolve, reject) {
        try {
            var key = config.rkeys.allow + channelId + '_' + userChannelId;
            client.get(key, function(err, status) {
                if(status == null || err) {
                    reject();
                } else {
                    resolve(status);
                }
            });
        } catch(e) {
            reject();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
 async function conActive(client, channelId, userChannelId) {
    return new Promise(async function (resolve, reject) {
        try {
            var value = channelId + '_' + userChannelId;
            client.lpush(config.rkeys.active, value, function(err, items) {
                resolve();
            });
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
 async function conInactive(client, channelId, userChannelId) {
    return new Promise(async function (resolve, reject) {
        try {
            var value = channelId + '_' + userChannelId;
            client.lrem(config.rkeys.active, 1, value);

            resolve();
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} sender 
 * @param {*} receiver 
 * @returns 
 */
 async function getConStatus(client, sender, receiver) {
    return new Promise(async function (resolve, reject) {
        try {
            client.lrange(config.rkeys.active, 0, -1,function(err, items) {
                if (err) {
                    console.log(err);
                }

                // Stored Value Format
                var value = sender + "_" + receiver;
                
                if(typeof items !== "undefined" && Array.isArray(items) && items.includes(value)) {
                    resolve();
                } else {
                    reject();
                }
            });
        } catch(e) {
            reject();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 */
async function isChannelOnline(client, channelId) {
    return new Promise(async function (resolve, reject) {
        try {
            client.lrange(config.rkeys.online, 0, -1,function(err, items) {
                if (err) {
                    console.log(err);
                }

                if(typeof items !== "undefined" && Array.isArray(items) && items.includes(channelId.toString())) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        } catch(e) {
            resolve(false);
        }
    });
}

/**
 * 
 * @param {*} client 
 */
async function deleteOnlineChannels(client) {
    return new Promise(async function (resolve, reject) {
        try {
            client.del(config.rkeys.online);
            resolve();
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @returns 
 */
async function deleteActiveChannels(client) {
    return new Promise(async function (resolve, reject) {
        try {
            client.del(config.rkeys.active);
            resolve();
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
 async function deleteAllowStatus(client, channelId, userChannelId) {
    return new Promise(async function (resolve, reject) {
        try {
            var key = config.rkeys.allow + channelId + '_' + userChannelId;
            client.del(key);
        } catch(e) {
            reject();
        }
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
    conStatus,
    getAllowStatus,
    conActive,
    conInactive,
    getConStatus,
    isChannelOnline,
    deleteOnlineChannels,
    deleteActiveChannels,
    deleteAllowStatus
}