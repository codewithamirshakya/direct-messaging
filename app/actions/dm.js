const m         = require('../config/message.js');
const dm        = require('../services/dm.js');
const em        = require('../services/emoji.js');
const ul        = require('../services/userlist.js');
const dmr       = require('../services/dmr.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @param {*} ws 
 * @returns 
 */
 async function action(initialJSON, inputJSON, ws) 
 {
    return new Promise(async function (resolve, reject) {
        switch(inputJSON.type) {
            // Direct Messaging
            case m.type.messaging.send:
                // Message Handler
                dm.messaging(initialJSON, inputJSON, ws).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Channel Message History
            case m.type.messaging.history:
                // Message History Handler
                dm.history(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Message list
            case m.type.messaging.messageList:
                // Message channels list history Handler
                dm.messageList(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // User list
            case m.type.messaging.userList:
                // Message user list Handler
                ul.list(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Emoji List
            case m.type.emotes.list:
                // Emoji List Handler
                em.list(initialJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Emoji Subscribed
            case m.type.emotes.subscribed:
                // Emoji Subscribed Handler
                em.subscribed(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Ban User
            case m.type.user.ban:
                // Ban User Handler
                ul.banUser(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Remove Message
            case m.type.messaging.remove:
                // Remove Message Handler
                dm.removeMessage(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Delete Message
            case m.type.messaging.delete:
                // Remove Message Handler
                dm.deleteMessage(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Channel Message Search History
            case m.type.messaging.search:
                // Message Search History Handler
                dm.search(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;   
                
            // Active Conversation
            case m.type.messaging.active:
                // Message Search History Handler
                dm.active(initialJSON, inputJSON, ws).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Someone is Typing
            case m.type.messaging.typing:
                // Message Search History Handler
                dm.typing(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Accept dm request
            case m.type.messaging.accept:
                // Message Search History Handler
                dmr.accept(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // DR Message list
            case m.type.messaging.mrList:
                // Message channels list history Handler
                dmr.messageList(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;

            // Delete all message request
            case m.type.messaging.mrDeleteAll:
                // Delete all message request Handler
                dmr.deleteAllMessageRequest(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;    
                
            case m.type.messaging.mrDelete:
                // Delete message request Handler
                dmr.deleteMessageRequest(initialJSON, inputJSON).then(function(message) {
                    resolve(message);
                }).catch(function(e) {
                    reject(e);
                });
                break;      
        }
    });
}

module.exports = {
    action
}