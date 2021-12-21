const m             = require('../config/message.js');
const config        = require('../utils/default.js');


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

        resolve(param);
    });
}

async function userList(users) {
    return new Promise(async function (resolve, reject) {
        var i = 0;
        var res = [];
        for(var i=0; i<users.length;i++) {
            param 	  	= { 
                c:      parseInt(users[i].id),
                n:      users[i].name,
                i:      users[i].avatar,
                y:      users[i].account_type.substring(0,1),
                d:      config.dateToUnixTimeStamp(users[i].last_live),
                o:      Boolean(users[i].online)
            };

            res.push(param)
        }           

        resolve(res);
    });
}

module.exports = {
    dm,
    userList
}