const m             = require('../config/message.js');
const config        = require('../config/default.js');
const em            = require('../models/emoji.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function dm(initialJSON, inputJSON, settings) {
    return new Promise(async function (resolve, reject) {
        if(inputJSON.message.length > 255) {
            inputJSON.message = inputJSON.message.substr(0, 255);
        }
        
        var param 	  	= { 
            t:      m.response.messaging.send,
            c:      parseInt(inputJSON.channelId),
            u:      parseInt(initialJSON.userChannelId),
            n:      typeof(initialJSON.displayName) === "undefined" ? "" : initialJSON.displayName,
            rn:     typeof(settings.d) === "undefined" ? "" : settings.d,
            ri:     typeof(settings.i) === "undefined" ? "" : settings.i,
            i:      typeof(initialJSON.avatar) === "undefined" ? "" : initialJSON.avatar,
            y:      typeof(initialJSON.accountType) === "undefined" ? "" : initialJSON.accountType,
            m:      inputJSON.message,
            d:      Date.now() 
        };

        // Get Emoji Url
        fetchEmojiUrl(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.message).then(function(url) {
            if(typeof url !== "undefined" && url.length > 0) {
                param.e = url;
            }

            resolve(param);
        }).catch(function(e) {
            resolve(param);
        })
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 * @param {*} message 
 */
 async function fetchEmojiUrl(connection, channelId, message) {
    return new Promise(async function (resolve, reject) {
        var emojiUrls       = [];

        try {
            var replaceColon    = message.replace(/::/g, ": :");
            var splitString     = replaceColon.split(/\s+/);

            for(i in splitString) {
                var msg             = splitString[i];
                var firstChar       = msg.charAt(0);
                var lastChar        = msg.charAt(msg.length - 1);

                if(firstChar == ":" && lastChar == ":") {
                    try {
                        var code        = msg.slice(1,-1);
                        var codeSplit   = code.split("-");
                        
                        if(typeof codeSplit[0] !== "undefined" && typeof codeSplit[1] !== "undefined" && codeSplit[0] != 'ptv') {
                            var emojiCode       = code.substring(code.indexOf('-') + 1);
                            var channelName     = codeSplit[0].slice(1);

                            await getEmojiUrl(connection, channelId, channelName, emojiCode).then(function(param) {
                                emojiUrls.push(param);
                            });
                        }
                    } catch(e) {
                    
                    }
                }
            }

            resolve(emojiUrls);
        } catch(e) {
            resolve(emojiUrls);
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channelName 
 * @param {*} emojiCode 
 */
 async function getEmojiUrl(connection, myChannelId, channelName, emojiCode) {
    return new Promise(async function (resolve, reject) {
        em.getEmojiByCode(connection, channelName, emojiCode).then(function(emoji) {
            if(typeof emoji !== "undefined") {
                aliasChannelId = emoji.channel_id;

                if(aliasChannelId == myChannelId) {
                    var channelId   = aliasChannelId.toString();
                    var emojiPath   = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.emojiAlias;
                    var url         = config.minio.bucket + "/" + emojiPath + "/" + emojiCode + ".gif";
                    
                    var emojiUrlObj = {
                        a: emojiCode,
                        u: url
                    };
    
                    resolve(emojiUrlObj);
                }
            } else {
                resolve();
            }
        }).catch(function(e) {
            resolve();
        });
    });
}

module.exports = {
    dm
}