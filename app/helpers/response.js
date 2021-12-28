const m         = require('../config/message.js');
const config    = require('../config/default.js');
const utils     = require('../utils/default.js');

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
 * @param {*} successCode 
 * @response JSON
 */
function genericResponse(type, initialJson, inputJson, success) {
    var response = JSON.stringify({
        t: type,
        pg: typeof inputJson.page !== 'undefined' ? inputJson.page : "",
        c: typeof inputJson.channelId !== 'undefined' ? inputJson.channelId : "",
        su: success
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
 * @param {*} message 
 */
 async function systemMessage(message, links, icons, append, cat, whisper) {
    return new Promise(async function (resolve, reject) {
        var response = JSON.stringify({
                            t:       m.type.system,
                            m:   [{
                                t:   m.type.system,
                                m:   message, 
                                l:   links,
                                ic:   icons
                            }],
                            z: append,
                            c: cat,
                            w: whisper
                        });

        resolve(response);
    });
}

/**
 * 
 * @param {*} result 
 */
async function paginated(type, result, paginated, initialJson, inputJson) {
    return new Promise(async function (resolve, reject) {
        var response = JSON.stringify({
            p: paginated,
            t: type, 
            m: result,
            pg: typeof inputJson.page !== 'undefined' ? inputJson.page : "",
            c: typeof inputJson.channelId !== 'undefined' ? inputJson.channelId : "",
            u: typeof initialJson.userChannelId !== 'undefined' ? initialJson.userChannelId : ""
        });

        resolve(response);
    });
}

/**
 * 
 * @param {*} result 
 * @returns 
 */
async function formatHistory(type,result, first, paginated, inputJson) {
    return new Promise(async function (resolve, reject) {
        var res = [];
        if(first == true || (typeof inputJson.reverse !== "undefined" && inputJson.reverse == true)) {
            res = result.reverse();
        } else {
            res = result;
        }
        

        var response = JSON.stringify({
            r: typeof inputJson.reverse !== "undefined" ? inputJson.reverse:false,
            q: typeof inputJson.q !== "undefined" ? inputJson.q:"",
            po: typeof inputJson.position !== "undefined" ? inputJson.position:"",
            p: paginated,
            t: type, 
            m: res
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
            for(i=0; i < result.length; i++) {
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

/**
 * 
 * @param {*} users 
 * @param {*} onlineChannels 
 * @param {*} onlineChannelTimeStamps 
 * @returns 
 */
 async function formatUserlist(users, onlineChannels, onlineChannelTimeStamps) {
    return new Promise(async function (resolve, reject) {
        var i   = 0;
        var res = [];
        
        for(var i=0; i<users.length;i++) {
            var channelId   = users[i].id.toString();
            var avatarPath  = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.avatarAlias;
            var avatar      = config.minio.bucket + "/" + avatarPath + "/" + users[i].avatar;
            var online      = (onlineChannels.indexOf(channelId) != -1) ? true: false; 
            var lastOnline  = (onlineChannelTimeStamps.indexOf(channelId) != -1) ? onlineChannelTimeStamps[onlineChannelTimeStamps.indexOf(channelId)]: ""; 

            param 	  	= { 
                c:      parseInt(users[i].id),
                n:      users[i].name,
                i:      avatar,
                y:      users[i].account_type.substring(0,1),
                d:      utils.dateToUnixTimeStamp(users[i].last_live),
                o:      Boolean(online),
                lo:     lastOnline
            };

            res.push(param)
        }           

        resolve(res);
    });
}

module.exports = {
    error,
    success,
    typeMessage,
    systemMessage,
    paginated,
    formatMessageList,
    formatSettings,
    formatEmojis,
    formatUserlist,
    formatHistory,
    genericResponse
}