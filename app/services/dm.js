const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const redmy         = require('../helpers/redmy.js');
const mongo         = require('../helpers/mongo.js');
const param         = require('../helpers/param.js');
const utility       = require('../helpers/utility.js');
const pub           = require('../publishers/redis.js');
const model         = require('../models/dm.js');
const setting       = require('../models/setting.js');
const conversation  = require('../models/conversation.js');
const dmh           = require('../helpers/dm.js');

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
                    validator.banValidation(initialJSON.redis, [inputJSON.channelId], initialJSON.userChannelId).then(function() {
                        // Is Message Allowed Validation
                        dmh.isDMAllowed(initialJSON, inputJSON).then(function() {
                            // Get Channel Settings
                            redmy.getChannelSetting(initialJSON.redis, initialJSON.mysqlConnection, inputJSON.channelId).then(function(settings) {
                                // Is Channel Online
                                redmy.isChannelOnline(initialJSON.redis, inputJSON.channelId).then(function(isOnline) {
                                    // Prepare Param
                                    param.dm(initialJSON, inputJSON, settings, isOnline).then(function(params) {
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
 * @todo need to refactor
 * @returns 
 */
async function history(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dch).then(function() {
            if(typeof inputJSON.search !== "undefined" && inputJSON.search == true) {
                searchHistory(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
            } else {
                conversationHistory(initialJSON, inputJSON).then(function(message) {
                    resolve(message)
                }).catch(function(e) {
                    reject(e);
                });
            }
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
async function searchHistory(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Mongo Query Param Reverse
        mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, true).then(function(qR) {
            // Mongo Query Param
            mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, false).then(function(q) {
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
        mongo.message(inputJSON.channelId, initialJSON.userChannelId, inputJSON.position, inputJSON.q, inputJSON.reverse).then(function(q) {                             
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

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function messageList(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dml).then(function() {
            // Mongo Query Param
            mongo.messageList(initialJSON.userChannelId).then(function(params) {
                // Limit Pagination
                var limit    = config.chat.limit;   
                var skip     = (inputJSON.page - 1) * config.chat.limit; 
                var sort     = {d: -1};

                // Get Conversation
                conversation.get(initialJSON.mongoConnection, params, sort, skip, limit).then(function(results) {
                    // Get ChannelIds
                    var channelIds = utility.getOtherChannelIdsFromResultSet(results, initialJSON.userChannelId);

                    // Fetch Channel Settings
                    setting.getDMSettings(initialJSON.mysqlConnection, channelIds).then(function(settings) {
                        // Fetch Banned Channels
                        redmy.getBanChannels(initialJSON.redis, initialJSON.userChannelId).then(function(bannedChannels) {   
                            // Format Message List
                            response.formatMessageList(initialJSON.userChannelId, results, settings, bannedChannels).then(function(list) {
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
                }).catch(function(e) {
                    // Prepare Response
                    response.paginated(m.response.messaging.messageList, [], inputJSON.page, inputJSON.q).then(function(message) {
                        resolve(message);
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.messageList));
                    });
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
 async function deleteMessage(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dmd).then(function() {
            // Self Message Validation Param
            var selfClause = mongo.selfMessage(inputJSON.channelId, initialJSON.userChannelId, inputJSON.messageId);

            // Check if Self Message
            model.exist(initialJSON.mongoConnection, selfClause).then(function() {
                // delete by id param
                mongo.deleteById(inputJSON.messageId).then(function(params) {
                    // Update seen status
                    model.remove(initialJSON.mongoConnection, params).then(function() {
                        // Prepare Response
                        response.typeMessage(m.response.messaging.delete, {_id: inputJSON.messageId}).then(function(message) {
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

                        // Is Last Message; need to update conversation
                        if(typeof inputJSON.last !== 'undefined' && inputJSON.last == true) {
                            lastMessageDeletion(initialJSON, inputJSON);
                        }
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.delete));
                    });
                }).catch(function(e) {
                    reject(response.error(m.errorCode.messaging.delete));
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.delete));
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
 * @returns 
 */
async function lastMessageDeletion(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Convo Param
        mongo.remove(inputJSON.channelId, initialJSON.userChannelId).then(function(params) {
            // Latest Message
            model.latest(initialJSON.mongoConnection, params).then(function(result) {
                // Update Conversation
                model.updateConversation(initialJSON.mongoConnection, result).then(function() {
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
async function removeMessage(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dmr).then(function() {
            // Remove Conversation
            removeConversation(initialJSON.mongoConnection, inputJSON.channelId, initialJSON.userChannelId).then(function(message) {
                resolve(message);
            }).catch(function(e) {
                reject(e);
            })
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.remove));
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
                    response.formatHistory(m.response.messaging.search, result, inputJSON.position, inputJSON.reverse).then(function(message) {
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
        conversation.update(initialJSON.mongoConnection, myClause, { $unset: { uc: 1 } }, { upsert: true }).then(function() {
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
 */
async function active(initialJSON, inputJSON, ws) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dma).then(function() {
            // If Active is Set
            if(inputJSON.set) {
                // Update Seen Status
                seenStatus(initialJSON, inputJSON).then(function() {
                    // Prepare Response
                    response.typeMessage(m.response.messaging.seenStatus, {c: inputJSON.channelId}).then(function(message) {
                        // Publish
                        pub.publish(initialJSON, initialJSON.userChannelId, message).then(function() {

                        }).catch(function(e) {

                        });
                    }).catch(function(e) {

                    });

                    // Prepare Response
                    response.typeMessage(m.response.messaging.readStatus, {c: initialJSON.userChannelId}).then(function(message) {
                        // Publish
                        pub.publish(initialJSON, inputJSON.channelId, message).then(function() {

                        }).catch(function(e) {

                        });
                    }).catch(function(e) {

                    });
                }).catch(function(e) {

                });

                // Active Conversation
                redmy.conActive(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId);

                // Store Active Conversation in Socket
                storeSocketActive(ws, inputJSON.channelId);

                // Check if Chat is Allowed
                dmh.allowChat(initialJSON, inputJSON).then(function(status) {
                    // Update Active Conversation
                    redmy.conStatus(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId, status).then(function() {
                        resolve(response.success(m.successCode.dma.success));
                    }).catch(function() {
                        resolve(response.success(m.errorCode.dma.error));
                    });
                });
            } else {
                // InActive Conversation
                redmy.conInactive(initialJSON.redis, inputJSON.channelId, initialJSON.userChannelId);

                // Update Socket for Inactive Channel
                updateSocketInactive(ws, inputJSON.channelId);

                resolve(response.success(m.successCode.dma.success));
            }
        }).catch(function(e) {
            reject(response.error(m.errorCode.dma.validation));
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
 */
async function typing(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dmt).then(function() {
            // Prepare Response
            response.typeMessage(m.response.messaging.typing, {c: initialJSON.userChannelId, g: inputJSON.set}).then(function(message) {
                // Publish
                pub.publish(initialJSON, inputJSON.channelId, message).then(function() {
                    resolve(true);
                }).catch(function(e) {
                    resolve(true);
                });
            }).catch(function(e) {
                resolve(true);
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.dmt.validation));
        });
    });
}

module.exports = {
    messaging,
    history,
    messageList,
    deleteMessage,
    removeMessage,
    search,
    active,
    typing
}