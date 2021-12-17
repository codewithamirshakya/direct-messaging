const {v1: uuidv1}  = require('uuid');
const m             = require('../config/message.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function dm(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        if(inputJSON.message.length > 255) {
            inputJSON.message = inputJSON.message.substr(0, 255);
        }
        
        var param 	  	= { 
            t:      m.response.messaging.send,
            c:      initialJSON.channelId, 
            u:      initialJSON.userChannelId,
            n:      typeof(initialJSON.displayName) === "undefined" ? "" : initialJSON.displayName,
            rn:     typeof(initialJSON.channelName) === "undefined" ? "" : initialJSON.channelName,
            i:      typeof(initialJSON.avatar) === "undefined" ? "" : initialJSON.avatar,
            y:      typeof(initialJSON.accountType) === "undefined" ? "" : initialJSON.accountType,
            m:      inputJSON.message, 
            id:     uuidv1(),
            d:      Date.now() 
        };

        resolve(param);
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
function storeParam(initialJSON, inputJSON) {
    var sparam 	  	= { 
        send:           m.response.messaging.send,
        receiverId:     initialJSON.channelId, 
        senderId:       initialJSON.userChannelId,
        senderName:     typeof(initialJSON.displayName) === "undefined" ? "" : initialJSON.displayName,
        receiverName:   typeof(initialJSON.channelName) === "undefined" ? "" : initialJSON.channelName,
        avatar:         typeof(initialJSON.avatar) === "undefined" ? "" : initialJSON.avatar,
        accountType:    typeof(initialJSON.accountType) === "undefined" ? "" : initialJSON.accountType,
        message:        inputJSON.message,
        date:           Date.now(),
        seenAt:         null
    };

    return sparam;
}

module.exports = {
    dm,
    storeParam
}