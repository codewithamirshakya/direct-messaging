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
async function paginated(type, result, page, q) {
    return new Promise(async function (resolve, reject) {
        var response = JSON.stringify({
            t: type, 
            m: result,
            pg: page,
            q: q
        });

        resolve(response);
    });
}

/**
 * 
 * @param {*} result 
 * @returns 
 */
async function formatHistory(type, result, position, reverse) {
    return new Promise(async function (resolve, reject) {
        var res = [];
        if(typeof position == "undefined" || (typeof reverse !== "undefined" && reverse == true)) {
            res = result.reverse();
        } else {
            res = result;
        }

        var response = {
            t: type, 
            m: res
        }

        if(typeof reverse !== "undefined") {
            response.r = reverse;
        }

        if(typeof position !== "undefined") {
            response.po = position;
        }

        resolve(JSON.stringify(response));
    });
}

/**
 * 
 * @param {*} result 
 * @returns 
 */
async function formatMessageList(result, settings, seens, bannedChannels) {
    return new Promise(async function (resolve, reject) {
        var res         = [];
        var settingRes  = [];
        if(typeof settings !== "undefined") {
            settings.forEach(function (setting) {
                if(typeof setting !== "undefined") {
                    settingRes[setting.channel_id] = setting;
                }           
            });
        }
        
        try {
            for(i=0; i < result.length; i++) {
                if(typeof result[i] !== "undefined") {
                    
                    res[i]          = result[i];
                    
                    res[i].c        = res[i]._id; 
                    res[i].bn       = false; 
                    res[i].o        = false; 
                    res[i].lo       = ""; 
                    res[i].us       = typeof seens[i] !== "undefined" && typeof seens[i].us !== "undefined" ? seens[i].us : 0; 

                    delete res[i]._id;
                }
            }
        } catch(e) {
            console.log(e);    
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
 async function formatUserlist(users, bannedChannels) {
    return new Promise(async function (resolve, reject) {
        var i   = 0;
        var res = [];

        for(var i=0; i<users.length; i++) {
            if(typeof users[i] !== "undefined") {
                var follower = users[i];
                if(typeof follower.id !== "undefined") {
                    var channelId   = follower.id.toString();

                    if(typeof follower.avatar !== "undefined") {
                        var avatarPath  = channelId.substring(0, 1) + "/" + channelId.substring(0, 2) + "/" + channelId + "/" + config.minio.avatarAlias;
                        var avatar      = config.minio.bucket + "/" + avatarPath + "/" + follower.avatar;
                    }

                    if(typeof bannedChannels !== "undefined") {
                        var isBanned    = (bannedChannels.indexOf(channelId) != -1) ? true: false;
                    }
                }

                var param  = { 
                    c:      parseInt(follower.id),
                    n:      follower.name,
                    i:      avatar,
                    y:      follower.account_type.substring(0,1),
                    bn:     isBanned,
                    rr:     follower.show_read_receipts
                };

                if(typeof follower.show_online_status !== "undefined" && follower.show_online_status) {
                    param.o     = follower.online;
                }

                if(typeof follower.show_last_online !== "undefined" && follower.show_last_online && typeof follower.last_online !== "undefined") {
                    param.lo     = utils.dateToUnixTimeStamp(follower.last_online);
                }

                res.push(param);   
            }
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
    formatHistory
}