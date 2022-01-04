const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const redmy         = require('../helpers/redmy.js');
const mongo         = require('../helpers/mongo.js');
const param         = require('../helpers/param.js');
const pub           = require('../publishers/redis.js');
const model         = require('../models/dm.js');
const setting       = require('../models/setting.js');
const conversation  = require('../models/conversation.js');
const em            = require('../models/emoji.js');
const channel       = require('../models/channel.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
 async function messaging(initialJSON, inputJSON, ws) {
    return new Promise(async function (resolve, reject) {
        // Antispam Check; message limit 2/s
        validator.canSendMessage(ws).then(function() {
            // RateLimit Validation
            validator.rateLimitValidation(ws).then(function() {
                // Validate Input
                validator.validation(inputJSON, validator.rules.dm).then(function() {
                    // Check if user is banned
                    validator.banValidation(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId).then(function() {
                        // Is Message Allowed Validation
                        redmy.isDMAllowed(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId).then(function() {
                            // Get Channel Settings
                            redmy.getChannelSetting(initialJSON.redis, initialJSON.mysqlConnection, inputJSON.channelId).then(function(settings) {
                                // Prepare Param
                                param.dm(initialJSON, inputJSON, settings).then(function(params) {   
                                    // Save Model                
                                    model.save(initialJSON.mongoConnection, params).then(function(insertedId) {
                                        // Prepare Response
                                        response.typeMessage(m.response.messaging.send, params).then(function(message) {
                                            // Publish Message
                                            pub.publish(initialJSON, inputJSON.channelId, message).then(function() {
                                                resolve(true);
                                            }).catch(function(e) {
                                                resolve(true);
                                            });

                                            pub.publish(initialJSON, initialJSON.userChannelId, message).then(function() {
                                                resolve(true);
                                            }).catch(function(e) {
                                                resolve(true);
                                            });
                                        });
                                    }).catch(function(e) {
                                        reject(response.error(m.errorCode.messaging.save));
                                    });
                                }).catch(function(e) {
                                    reject(response.error(m.errorCode.messaging.validation));
                                });
                            }).catch(function(e) {
                                reject(response.error(m.errorCode.messaging.validation));
                            });
                        }).catch(function(e) {
                            reject(response.error(m.errorCode.messaging.follower));
                        });
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.banned));
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.validation));
                });
            }).catch(function(e) {
                response.systemMessage(m.system.SLOW_DOWN).then(function(alertMessage) {
                    resolve(alertMessage);
                });
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.restricted));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function history(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dch).then(function() {
            // Mongo Query Param
            mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, inputJSON.reverse).then(function(q) {                             
                // Fetch History
                model.history(initialJSON.mongoConnection, q).then(function(result) {             
                    // Prepare Response
                    response.formatHistory(m.response.messaging.history, result, inputJSON.position, inputJSON.reverse).then(function(message) {
                        resolve(message);
                    });                   
                }).catch(function(e) {
                    console.log(e);
                    reject(response.error(m.errorCode.messaging.history));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.history));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.history));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function messageList(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dml).then(function() {
            // Mongo Query Param    
            mongo.list(initialJSON.userChannelId, inputJSON.q).then(function(q) {
                // Limit Pagination
                limit    = config.chat.limit;   
                skip     = (inputJSON.page - 1) * config.chat.limit; 

                // Fetch History
                model.aggregate(initialJSON.mongoConnection, q, limit, skip).then(function(result) {
                    // parse channel IDs from following object collection
                    var channelIds = [];
                    if(typeof result !== "undefined") {
                        result.forEach(function (r) {
                            channelIds.push(r._id);
                        });
                    }
                    mongo.seenCount(channelIds, initialJSON.userChannelId).then(function(cq) {
                        model.aggregate(initialJSON.mongoConnection, cq, limit, skip).then(function(resultSeen) {
                            // Fetch Channel Settings
                            setting.getDMSettings(initialJSON.mysqlConnection, channelIds).then(function(settings) {
                                // Fetch Banned Channels
                                redmy.getBanChannels(initialJSON.redis, initialJSON.userChannelId).then(function(bannedChannels) {                    
                                    // Format Message List
                                    response.formatMessageList(result, settings, resultSeen, bannedChannels).then(function(list) {
                                        // Prepare Response
                                        response.paginated(m.response.messaging.messageList, list, inputJSON.page, inputJSON.q).then(function(message) {
                                            resolve(message);
                                        }).catch(function(e) {
                                            reject(response.error(m.errorCode.messaging.messageList));
                                        });
                                    }).catch(function(e) {
                                        reject(response.error(m.errorCode.messaging.messageList));
                                    });
                                }).catch(function(e) {
                                    reject(response.error(m.errorCode.messaging.messageList));
                                });
                            }).catch(function(e) {
                                reject(response.error(m.errorCode.messaging.messageList));
                            });
                        });
                        
                    });
                    
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.messageList));
                }); 
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.messageList));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.messageList));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function seenStatus(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Mongo Query Param
        mongo.seenStatus(inputJSON.channelId, initialJSON.userChannelId).then(function(q) { 
            // Update seen status
            model.update(initialJSON.mongoConnection, q, { $set: { ss: true } }).then(function() {
                resolve();
            }).catch(function(e) {
                reject(e);
            });
        }).catch(function(e) {
            reject(e);
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
 */
async function deleteMessages(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dmd).then(function() {
            // Mongo Query Param
            mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position).then(function(q) { 
                // Update seen status
                model.remove(initialJSON.mongoConnection, q).then(function() {
                    // Prepare Response
                    response.typeMessage(m.response.messaging.delete, {c: inputJSON.channelId}).then(function(message) {
                        resolve(message);
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.delete));
                });
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.delete));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function search(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dms).then(function() {
            // Mongo Query Param
            mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, inputJSON.reverse).then(function(q) {  

                // Fetch History
                model.history(initialJSON.mongoConnection, q).then(function(result) {
                    // Prepare Response
                    response.formatHistory(m.response.messaging.search, null, result, inputJSON.position, inputJSON.reverse).then(function(message) {
                        resolve(message);
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.search));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.search));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.search));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function active(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dma).then(function() {
            if(inputJSON.set) {
                // Update Seen Status
                seenStatus(initialJSON, inputJSON).then(function() {
                    // Prepare Response
                    response.typeMessage(m.response.messaging.seenStatus, {c: initialJSON.userChannelId}).then(function(message) {
                        // Publish
                        pub.publish(initialJSON, inputJSON.channelId, message).then(function() {

                        }).catch(function(e) {

                        });
                    }).catch(function(e) {

                    });
                }).catch(function(e) {

                });

                // Check if Chat is Allowed
                allowChat(initialJSON, inputJSON).then(function(allowChat) {
                    // Update Active Conversation
                    redmy.conActive(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId, allowChat).then(function() {
                        resolve(response.success(m.successCode.dma.success));
                    }).catch(function() {
                        resolve(response.success(m.errorCode.dma.error));
                    });
                });
            } else {
                redmy.conInactive(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId).then(function() {
                    resolve(response.success(m.successCode.dma.success));
                }).catch(function() {
                    resolve(response.success(m.errorCode.dma.error));
                });
            }
        }).catch(function(e) {
            reject(response.error(m.errorCode.dma.validation));
        });
    });
}

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
                setting.getDMSettings(initialJSON.mysqlConnection, [inputJSON.channelId]).then(function(dmSetting) {
                    if(typeof dmSetting !== "undefined") {
                        if(typeof dmSetting.allow_message_every_one !== "undefined" && dmSetting.allow_message_every_one == true) {
                            resolve(true);
                        } else if(typeof dmSetting.allow_message_subscriber !== "undefined" && dmSetting.allow_message_subscriber == true) {
                            em.isSubscriber(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                                resolve(true);
                            }).catch(function(e) {
                                resolve(false);
                            });
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
        }).catch(function(e) {
            resolve(false);
        });
    });
}

module.exports = {
    messaging,
    history,
    messageList,
    deleteMessages,
    search,
    active
}