const config    = require('../config/default.js');
const response  = require('../helpers/response.js');
const sm        = require('../models/setting.js');

/**
 * 
 * @param {*} client 
 * @param {*} connection 
 * @param {*} channelId 
 */
 async function getChannelSetting(client, connection, channelId) {
    return new Promise(async function (resolve, reject) {
        client.get(config.rkeys.settings + channelId, function(err, channelSetting) {
            if(channelSetting == null || err) {
                sm.get(connection, channelId).then(function(cs) {
                    response.formatSettings(cs).then(function(channelSetting) {
                        if(typeof channelSetting !== "undefined") {
                            client.set(config.rkeys.settings + channelId, JSON.stringify(channelSetting), 'EX', config.expire.settings);
                            
                            resolve(channelSetting);
                        } else {
                            resolve();
                        }
                    });
                });
            } else {
                try {
                    setting = JSON.parse(channelSetting);
                    
                    resolve(setting);
                } catch(e) {
                    console.log(e);
                    resolve();
                }
            }
        });   
    });
}

module.exports = {
    getChannelSetting
}