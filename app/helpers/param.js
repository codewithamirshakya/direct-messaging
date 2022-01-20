const m             = require('../config/message.js');
const config        = require('../config/default.js');
const em            = require('../models/emoji.js');
const redmy         = require('../helpers/redmy.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
 async function dm(initialJSON, inputJSON, settings, isOnline, isRequest) {
    return new Promise(async function (resolve, reject) {
        if(initialJSON.accountType == config.accountType.premium) {
            if(inputJSON.message.length > config.chat.premiumMessageLength) {
                inputJSON.message = inputJSON.message.substr(0, config.chat.premiumMessageLength);
            }
        } else {
            if(inputJSON.message.length > config.chat.defaultMessageLength) {
                inputJSON.message = inputJSON.message.substr(0, config.chat.defaultMessageLength);
            }
        }
        
        var ri = "";
        if(typeof settings.i !== "undefined" && typeof settings.c !== "undefined") {
            var channelId   = settings.c.toString();
            var avatarPath  = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.avatarAlias;
            ri              = config.minio.bucket + "/" + avatarPath + "/" + settings.i;
        }
        
        var param 	  	= { 
            t:      m.response.messaging.send,
            c:      parseInt(inputJSON.channelId),
            u:      parseInt(initialJSON.userChannelId),
            n:      typeof(initialJSON.displayName) === "undefined" ? "" : initialJSON.displayName,
            rn:     typeof(settings.d) === "undefined" ? "" : settings.d,
            ri:     ri,
            ry:     typeof(settings.y) === "undefined" ? "" : settings.y,
            i:      typeof(initialJSON.avatar) === "undefined" ? "" : initialJSON.avatar,
            y:      typeof(initialJSON.accountType) === "undefined" ? "" : initialJSON.accountType,
            s:      typeof(initialJSON.streamer) === "undefined" ? false : Boolean(initialJSON.streamer),
            m:      inputJSON.message,
            d:      Date.now(),
            f:      initialJSON.verified,   // Verified
            po:     Date.now(), // Position
        };

        // Delivered
        if(typeof isOnline !== "undefined" && isOnline) {
            param.dv = isOnline;
        }

        // Message Request
        if(typeof isRequest !== "undefined" && isRequest) {
            param.ir = isRequest;
        }

        // Get Emoji Url
        fetchEmojiUrl(initialJSON.mysqlConnection, initialJSON.userChannelId, inputJSON.message).then(function(url) {
            if(typeof url !== "undefined" && url.length > 0) {
                param.e = url;
            }

            redmy.getConStatus(initialJSON.redis, initialJSON.userChannelId, inputJSON.channelId).then(function(status) {
                param.ss = true;

                resolve(param);
            }).catch(function(e) {
                resolve(param);
            });
        }).catch(function(e) {
            redmy.getConStatus(initialJSON.redis, initialJSON.userChannelId, inputJSON.channelId).then(function(status) {
                param.ss = true;

                resolve(param);
            }).catch(function(e) {
                resolve(param);
            });
        });
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channelId 
 * @param {*} messageChannelId 
 * @param {*} message 
 * @returns 
 */
 async function fetchEmojiUrl(connection, channelId, message) {
    return new Promise(async function (resolve, reject) {
        var emojiUrls       = [];

        try {
            var emojiCodeRegEx  = /:([^ :]+):/g;
            var emojiCodes      = [];
            while ( regexMatch = emojiCodeRegEx.exec(message) ) {
                emojiCodes.push(regexMatch[1]);
            }

            for(i in emojiCodes) {
                try {
                    var code        = emojiCodes[i];
                    var codeSplit   = code.split("-");
                    
                    if(typeof codeSplit[0] !== "undefined" && typeof codeSplit[1] !== "undefined" && codeSplit[0] != 'ptv') {
                        var emojiCode       = code.substring(code.indexOf('-') + 1);
                        var channelName     = codeSplit[0].slice(1);

                        await getEmojiUrl(connection, channelId, channelName, emojiCode, code).then(function(param) {
                            emojiUrls.push(param);
                        });
                    }
                } catch(e) {
                    
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
 async function getEmojiUrl(connection, myChannelId, channelName, emojiCode, code) {
    return new Promise(async function (resolve, reject) {
        em.getEmojiByCode(connection, channelName, emojiCode).then(function(emoji) {
            if(typeof emoji !== "undefined") {
                aliasChannelId = emoji.channel_id;

                if(aliasChannelId == myChannelId) {
                    var channelId   = aliasChannelId.toString();
                    var emojiPath   = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.emojiAlias;
                    var url         = config.minio.bucket + "/" + emojiPath + "/" + emojiCode + ".gif";
                    
                    var emojiUrlObj = {
                        a: code,
                        u: url
                    };
    
                    resolve(emojiUrlObj);
                } else {
                    em.isSubscriber(connection, aliasChannelId, myChannelId).then(function() {
                        var channelId   = aliasChannelId.toString();
                        var emojiPath   = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.emojiAlias;
                        var url         = config.minio.bucket + "/" + emojiPath + "/" + emojiCode + ".gif";
                        
                        var emojiUrlObj = {
                            a: code,
                            u: url
                        };
        
                        resolve(emojiUrlObj);
                    }).catch(function(e) {
                        resolve();
                    });
                }
            } else {
                resolve();
            }
        }).catch(function(e) {
            resolve();
        });
    });
}

/**
 * 
 * @param {*} myChannelId 
 * @param {*} params 
 */
async function myConvo(params) {
    return new Promise(async function (resolve, reject) {
        var param 	  	= { 
            c:      parseInt(params.c),
            u:      parseInt(params.u),
            rn:     params.rn,
            ri:     params.ri,
            ry:     params.ry,
            m:      params.m,
            d:      params.d
        };

        resolve(param);
    });
}

/**
 * 
 * @param {*} myChannelId 
 * @param {*} params 
 */
 async function theirConvo(params) {
    return new Promise(async function (resolve, reject) {
        var param 	  	= { 
            c:      parseInt(params.u),
            u:      parseInt(params.c),
            rn:     params.n,
            ri:     params.i,
            ry:     params.y,
            m:      params.m,
            d:      params.d
        };

        resolve(param);
    });
}

module.exports = {
    dm,
    myConvo,
    theirConvo
}