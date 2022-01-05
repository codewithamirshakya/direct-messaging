const mongo         = require('../helpers/mongo.js');
const param         = require('../helpers/param.js');
const model         = require('../models/dm.js');
const em            = require('../models/emoji.js');
const channel       = require('../models/channel.js');
const setting       = require('../models/setting.js');
const conversation  = require('../models/conversation.js');
const redmy         = require('../helpers/redmy.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function allowChat(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        mongo.conversation(inputJSON.channelId, initialJSON.userChannelId).then(function(params) {
            conversation.exist(initialJSON.mongoConnection, params).then(function(result) {
                resolve(true);
            }).catch(function(e) {
                model.latest(initialJSON.mongoConnection, params).then(function(result) {
                    if(typeof result.c !== "undefined" && typeof result.u !== "undefined" && result.u == initialJSON.userChannelId) {
                        // update my conversation
                        param.myConvo(result).then(function(myConvoParams) {
                            var myClause  = mongo.myConvoClause(result.c, result.u);
                            conversation.update(initialJSON.mongoConnection, { $set: myConvoParams } , myClause, { upsert: true });
                        });
                    } else if(typeof result.u !== "undefined" && typeof result.c !== "undefined" && result.c == initialJSON.userChannelId) {
                        // update my conversation
                        param.theirConvo(result).then(function(myConvoParams) {
                            var myClause  = mongo.theirConvoClause(result.c, result.u);
                            conversation.update(initialJSON.mongoConnection, { $set: myConvoParams } , myClause, { upsert: true });
                        });
                    }

                    resolve(true);
                }).catch(function(e) {
                    setting.getDMSettings(initialJSON.mysqlConnection, [inputJSON.channelId]).then(function(dmSetting) {
                        if(typeof dmSetting !== "undefined") {
                             if(typeof dmSetting.allow_message_subscriber !== "undefined" && dmSetting.allow_message_subscriber == true) {
                                em.isSubscriber(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                                    resolve(true);
                                }).catch(function(e) {
                                    resolve(false);
                                });
                            } else if(typeof dmSetting.allow_message_every_one !== "undefined" && dmSetting.allow_message_every_one == true) {
                                resolve(true);
                            } else {
                                channel.isFollower(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                                    resolve(true);
                                }).catch(function(e) {
                                    resolve(false);
                                });
                            }
                        } else {
                            channel.isFollower(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                                resolve(true);
                            }).catch(function(e) {
                                resolve(false);
                            });
                        }
                    });
                });
            });
        }).catch(function(e) {
            resolve(false);
        });
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
 async function isDMAllowed(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        try {
            redmy.getConStatus(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId).then(function(status) {
                if(status == "true") {
                    resolve();
                } else {
                    reject();
                }
            }).catch(function(e) {
                allowChat(initialJSON, inputJSON).then(function(status) {
                    // Update Active Conversation
                    redmy.conActive(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId, status).then(function() {
                        resolve();
                    }).catch(function() {
                        resolve();
                    });

                    if(status) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            })
        } catch(e) {
            reject();
        }
    });
}

module.exports = {
    allowChat,
    isDMAllowed
}