const m             = require('../config/message.js');
const mongo         = require('../helpers/mongo.js');
const param         = require('../helpers/param.js');
const model         = require('../models/dm.js');
const em            = require('../models/emoji.js');
const channel       = require('../models/channel.js');
const setting       = require('../models/setting.js');
const mrequest      = require('../models/mrequest.js');
const conversation  = require('../models/conversation.js');
const redmy         = require('../helpers/redmy.js');
const response      = require('../helpers/response.js');
const pub           = require('../publishers/redis.js');
const DMSTATUS      = {
    allowed:    "true",
    request:    "MR",
    forbidden:  "false"
};

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function allowChat(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Check for Conversation
        haveConversation(initialJSON, inputJSON).then(function() {
            resolve(DMSTATUS.allowed);
        }).catch(function(e) {
            // Check for Request
            haveRequest(initialJSON, inputJSON).then(function() {
                resolve(DMSTATUS.request);
            }).catch(function(e) {
                // Check for Previous Direct Messages
                haveDirectMessages(initialJSON, inputJSON).then(function() {
                    console.log("hdm resolved");
                    resolve(DMSTATUS.allowed);
                }).catch(function(e) {
                    // Check for Settings
                    settingCheck(initialJSON, inputJSON).then(function(status) {
                        resolve(status);
                    }).catch(function() {
                        resolve(DMSTATUS.forbidden);
                    });
                })
            });
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
 async function haveConversation(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Conversation Param
        mongo.conversation(inputJSON.channelId, initialJSON.userChannelId).then(function(params) {
            // Find Conversation
            conversation.findOne(initialJSON.mongoConnection, params).then(function(result) {
                resolve();
            }).catch(function(e) {
                reject();
            });
        }).catch(function(e) {
            reject();
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function haveRequest(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Request Param
        mongo.request(inputJSON.channelId, initialJSON.userChannelId).then(function(params) {
            // Find Request
            mrequest.findOne(initialJSON.mongoConnection, params).then(function(result) {
                resolve();
            }).catch(function(e) {
                reject();
            });
        }).catch(function(e) {
            reject();
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
async function haveDirectMessages(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Direct Message Param
        mongo.directMessage(inputJSON.channelId, initialJSON.userChannelId).then(function(params) {
            console.log(params);
            // Latest Message
            model.latest(initialJSON.mongoConnection, params).then(function(result) {
                console.log("hdm", result);
                if(typeof result.c !== "undefined" && typeof result.u !== "undefined" && result.u == initialJSON.userChannelId) {
                    // update my conversation
                    updateMyConversation(initialJSON.mongoConnection, result);
                } else if(typeof result.u !== "undefined" && typeof result.c !== "undefined" && result.c == initialJSON.userChannelId) {
                    // update my conversation
                    updateTheirConversation(initialJSON.mongoConnection, result);
                }

                resolve();
            }).catch(function(e) {
                reject();
            });
        }).catch(function(e) {
            reject();
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function settingCheck(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // If Follower; Allow
        channel.isFollower(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.channelId).then(function() {
            resolve(DMSTATUS.allowed);
        }).catch(function(e) {
            // Fetch Settings
            setting.getDMSettings(initialJSON.mysqlConnection, [inputJSON.channelId]).then(function(dmSetting) {
                // If has Settings
                if(typeof dmSetting !== "undefined" && typeof dmSetting[0] !== "undefined") {
                    // If Subscriber Mode
                    if(typeof dmSetting[0].allow_message_subscriber !== "undefined" && dmSetting[0].allow_message_subscriber == true) {
                        // Subscriber and Follower are allowed
                        em.isSubscriber(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.channelId).then(function() {
                            resolve(DMSTATUS.allowed);
                        }).catch(function(e) {
                            resolve(DMSTATUS.forbidden);
                        });
                    } else if(typeof dmSetting[0].allow_message_every_one !== "undefined" && dmSetting[0].allow_message_every_one == true) {
                        resolve(DMSTATUS.request);
                    } else {
                        resolve(DMSTATUS.forbidden);
                    }
                } else {
                    resolve(DMSTATUS.forbidden);
                }
            });
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
            redmy.getAllowStatus(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId).then(function(status) {
                resolve(status)
            }).catch(function(e) {
                allowChat(initialJSON, inputJSON).then(function(status) {
                    // Update Active Conversation
                    redmy.conStatus(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId, status);

                    resolve(status);
                });
            });
        } catch(e) {
            reject();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 */
 async function updateConversation(connection, params) {
    return new Promise(function (resolve, reject) {
        // update my conversation
        param.myConvo(params).then(function(myConvoParams) {
            var myClause  = mongo.myConvoClause(params.c, params.u);
            conversation.update(connection, myClause, { $set: myConvoParams }, { upsert: true });
        });

        // update their conversation
        param.theirConvo(params).then(function(theirConvoParams) {
            var theirClause  = mongo.theirConvoClause(params.c, params.u);

            if(typeof params.ss !== "undefined" && params.ss) {
                conversation.update(connection, theirClause, { $set: theirConvoParams }, { upsert: true });
            } else {
                conversation.update(connection, theirClause, { $set: theirConvoParams, $inc: { uc: 1 } }, { upsert: true });
            }
        });

        resolve();
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @returns 
 */
async function updateMyConversation(connection, params) {
    return new Promise(function (resolve, reject) {
        // update my conversation
        param.myConvo(params).then(function(myConvoParams) {
            var myClause  = mongo.myConvoClause(params.c, params.u);
            conversation.update(connection, myClause, { $set: myConvoParams }, { upsert: true });
        });

        resolve();
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @returns 
 */
 async function updateTheirConversation(connection, params) {
    return new Promise(function (resolve, reject) {
        // update their conversation
        param.theirConvo(params).then(function(theirConvoParams) {
            var theirClause  = mongo.theirConvoClause(params.c, params.u);
            conversation.update(connection, theirClause, { $set: theirConvoParams }, { upsert: true });
        });

        resolve();
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @returns 
 */
async function updateTheirRequest(connection, params) {
    return new Promise(function (resolve, reject) {
        // update their conversation
        param.theirConvo(params).then(function(theirConvoParams) {
            var theirClause  = mongo.theirConvoClause(params.c, params.u);

            if(typeof params.ss !== "undefined" && params.ss) {
                mrequest.update(connection, theirClause, { $set: theirConvoParams }, { upsert: true });
            } else {
                mrequest.update(connection, theirClause, { $set: theirConvoParams, $inc: { uc: 1 } }, { upsert: true });
            }
        });

        resolve();
    });
}

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 * @returns 
 */
 async function removeConversation(connection, channelId, userChannelId) {
    return new Promise(async function (resolve, reject) {
        // channelid params
        mongo.remove(channelId, userChannelId).then(function(params) {
            // Update seen status
            conversation.remove(connection, params).then(function() {
                // Prepare Response
                response.typeMessage(m.response.messaging.remove, {c: channelId}).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.remove));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.remove));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.remove));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
 async function conversationMessage(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Get Channel Settings
        redmy.getChannelSetting(initialJSON.redis, initialJSON.mysqlConnection, inputJSON.channelId).then(function(settings) {
            // Is Channel Online
            redmy.isChannelOnline(initialJSON.redis, inputJSON.channelId).then(function(isOnline) {
                // Prepare Param
                param.dm(initialJSON, inputJSON, settings, isOnline).then(function(params) {
                    // Save Model                
                    model.save(initialJSON.mongoConnection, params).then(function(insertedId) {
                        // Update Conversation
                        updateConversation(initialJSON.mongoConnection, params).then(function() {
                            // Prepare Response
                            response.typeMessage(m.response.messaging.send, params).then(function(message) {
                                resolve(message);
                            });
                        }).catch(function(e) {
                            reject(response.error(m.errorCode.messaging.save));
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
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
 async function messageRequest(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Get Channel Settings
        redmy.getChannelSetting(initialJSON.redis, initialJSON.mysqlConnection, inputJSON.channelId).then(function(settings) {
            // Is Channel Online
            redmy.isChannelOnline(initialJSON.redis, inputJSON.channelId).then(function(isOnline) {
                // Prepare Param
                param.dm(initialJSON, inputJSON, settings, isOnline, true).then(function(params) {
                    // Save Model                
                    model.save(initialJSON.mongoConnection, params).then(function(insertedId) {
                        // Update Conversation
                        updateMyConversation(initialJSON.mongoConnection, params).then(function() {
                            // Update Their Request
                            updateTheirRequest(initialJSON.mongoConnection, params).then(function() {
                                // Prepare Response
                                response.typeMessage(m.response.messaging.send, params).then(function(message) {
                                    // Prepare Response
                                    response.typeMessage(m.response.messaging.request, params).then(function(requestm) {
                                        // Publish Message
                                        pub.publish(initialJSON, inputJSON.channelId, requestm).then(function() {
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
                                });
                            }).catch(function(e) {
                                reject(response.error(m.errorCode.messaging.save));
                            });
                        }).catch(function(e) {
                            reject(response.error(m.errorCode.messaging.save));
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
            reject(response.error(m.errorCode.messaging.validation));
        });
    });
}

/**
 * 
 * @param {*} ws 
 * @param {*} channelId 
 */
 async function storeSocketActive(ws, channelId) {
    if(typeof ws['ac'] !== "undefined" && ws['ac'].length > 0) {
        var activeArray  = ws['ac'];
        if(Array.isArray(activeArray)) {
            activeArray.push(channelId);
        } else {
            activeArray = [channelId];
        }

        ws['ac']     = activeArray;
    } else {
        ws['ac']     = [channelId];
    }
}

/**
 * 
 * @param {*} ws 
 * @param {*} channelId 
 */
async function updateSocketInactive(ws, channelId) {
    if(typeof ws['ac'] !== "undefined" && ws['ac'].length > 0) {
        if(Array.isArray(ws['ac'])) {
            ws['ac'] = ws['ac'].filter(function(item) {
                return item !== channelId
            });
        }
    }
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

        // Mongo Query Param   
        var myClause  = mongo.myConvoClause(inputJSON.channelId, initialJSON.userChannelId);

        // Unset Unread Count
        conversation.update(initialJSON.mongoConnection, myClause, { $unset: { uc: 1 } }, { upsert: false }).then(function() {
            resolve();
        }).catch(function(e) {
            reject(e);
        });

        // Unset Unread Count
        mrequest.update(initialJSON.mongoConnection, myClause, { $unset: { uc: 1 } }, { upsert: false }).then(function() {
            resolve();
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
 async function lastMessageDeletion(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Convo Param
        mongo.remove(inputJSON.channelId, initialJSON.userChannelId).then(function(params) {
            // Latest Message
            model.latest(initialJSON.mongoConnection, params).then(function(result) {
                // Update Conversation
                updateConversation(initialJSON.mongoConnection, result).then(function() {
                    // Prepare Response
                    response.typeMessage(m.response.messaging.updatelist, result).then(function(message) {
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
                    
                });
            }).catch(function(e) {
                // Remove My Conversation
                removeConversation(initialJSON.mongoConnection, inputJSON.channelId, initialJSON.userChannelId).then(function(message) {
                    // Publish Message
                    pub.publish(initialJSON, initialJSON.userChannelId, message).then(function() {
                        resolve(true);
                    }).catch(function(e) {
                        resolve(true);
                    });
                });

                // Remove their Conversation
                removeConversation(initialJSON.mongoConnection, initialJSON.userChannelId, inputJSON.channelId).then(function(message) {
                    // Publish Message
                    pub.publish(initialJSON, inputJSON.channelId, message).then(function() {
                        resolve(true);
                    }).catch(function(e) {
                        resolve(true);
                    });
                });
            });
        }).catch(function(e) {
            
        });

        resolve(true);
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function searchHistory(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Mongo Query Param Reverse
        mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, true, true).then(function(qR) {
            // Mongo Query Param
            mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, false, true).then(function(q) {
                // Fetch History Reverse
                model.history(initialJSON.mongoConnection, qR).then(function(resultRev) {  
                    // Fetch History 
                    model.history(initialJSON.mongoConnection, q).then(function(resultFor) {   
                        // Concat Response
                        var result = resultRev.reverse().concat(resultFor);

                        // Prepare Response
                        response.formatHistory(m.response.messaging.history, result, inputJSON.position, inputJSON.reverse, inputJSON.channelId).then(function(message) {
                            resolve(message);
                        });
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.history));
                    });          
                }).catch(function(e) {
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
 */
async function conversationHistory(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Mongo Query Param
        mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, inputJSON.reverse, false).then(function(q) {                             
            // Fetch History
            model.history(initialJSON.mongoConnection, q).then(function(result) { 
                // Reverse Result            
                if(typeof inputJSON.position == "undefined" || (typeof inputJSON.reverse !== "undefined" && inputJSON.reverse == true)) {
                    result = result.reverse();
                } 

                // Prepare Response
                response.formatHistory(m.response.messaging.history, result, inputJSON.position, inputJSON.reverse, inputJSON.channelId).then(function(message) {
                    resolve(message);
                });                   
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.history));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.history));
        });
    });
}

module.exports = {
    DMSTATUS,
    allowChat,
    isDMAllowed,
    updateConversation,
    removeConversation,
    conversationMessage,
    messageRequest,
    storeSocketActive,
    updateSocketInactive,
    seenStatus,
    lastMessageDeletion,
    searchHistory,
    conversationHistory
}