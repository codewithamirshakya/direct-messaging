const m         = require('../config/message.js');
const config    = require('../config/default.js');

/**
 * 
 * @param {*} errorCode 
 * @response JSON
 */
 function error(errorCode) {
    var response = JSON.stringify({
        success: false,
        code: errorCode
    });

    return response;
}

/**
 * 
 * @param {*} successCode 
 * @response JSON
 */
function success(successCode) {
    var response = JSON.stringify({
        success: true,
        code: successCode
    });

    return response;
}

/**
 * 
 * @param {*} type 
 * @param {*} message 
 */
 async function typeMessage(type, message) {
    return new Promise(async function (resolve, reject) {
        var response = JSON.stringify({
                            t:   type, 
                            m:   message
                        });

        resolve(response);
    });
}

/**
 * 
 * @param {*} result 
 */
async function paginated(type, result, paginated) {
    return new Promise(async function (resolve, reject) {
        var response = JSON.stringify({
            p: paginated,
            t: type, 
            m: result
        });

        resolve(response);
    });
}

/**
 * 
 * @param {*} result 
 * @returns 
 */
async function formatMessageList(result) {
    return new Promise(async function (resolve, reject) {
        var res = [];
        try {
            for(i=0; i< result.length; i++) {
                res[i]      = result[i];
                res[i].c    = result[i]._id;

                delete res[i]._id;
            }
        } catch(e) {

        }

        resolve(res);
    });
}

/**
 * 
 * @param {*} settings 
 */
 async function formatSettings(settings) {
    return new Promise(async function (resolve, reject) {
        if(typeof settings !== "undefined") {
            var setting = {
                c:          settings.channel_id,
                d:        settings.name,
                y:        settings.account_type,
                m:        settings.multistream,
                l:          settings.chat_style,
                e:             settings.emojis,
                se:     settings.simple_emojis,
                f:          settings.font_size,
                k:      settings.nickname_color,
                s:              settings.sound,
                t:          settings.timestamp,
                w:            settings.whisper,
                n:       settings.notification,
                al:        settings.access_level,
                aa:       settings.allow_account,
                au:           settings.allow_url,
                wl:          settings.whitelist,
                ml:   settings.ms_access_level,
                ma:  settings.ms_allow_account,
                mu:      settings.ms_allow_url,
                mw:     settings.ms_whitelist,
                a:              settings.admin,
                gw:     settings.display_whisper_globally,
                i:      settings.avatar,
                kt:     settings.enable_tip,
                km:     settings.minimum_tip
            };

            resolve(setting);
        } else {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} emojis 
 */
 async function formatEmojis(emojis) {
    return new Promise(async function (resolve, reject) {
        var emotes = [];
        if(typeof emojis !== "undefined") {
            emojis.forEach(emoji => {
                var channelId   = emoji.channel_id.toString();
                var emojiPath   = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.emojiAlias;
                var url         = config.minio.bucket + "/" + emojiPath + "/" + emoji.alias + ".gif";
                var emote = {
                    c:      emoji.channel_id,
                    a:      emoji.alias,
                    u:      url
                };

                if(typeof emoji.name !== "undefined") {
                    emote.n = emoji.name;
                }

                emotes.push(emote);
            });
        }

        resolve(emotes);
    });
}

module.exports = {
    error,
    success,
    typeMessage,
    paginated,
    formatMessageList,
    formatSettings,
    formatEmojis
}