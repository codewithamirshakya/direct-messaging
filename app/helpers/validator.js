const Validator     = require('validatorjs'); 
const utility       = require('../helpers/utility.js');
const redmy         = require('../helpers/redmy.js');

const rules = {
    dm: {
        type: "required",
        message: "required",
        channelId: "required"
    },
    dch: {
        type: "required",
        channelId: "required"
    },
    dml: {
        type: "required",
        page: "required"
    },
    ul: {
        type: "required",
        page: "required"
    },
    dms: {
        type: "required",
        channelId: "required",
        q: "required"
    },
    ub: {
        channelId: "required"
    },
    dmr: {
        channelId: "required"
    },
    dmd: {
        messageId: "required"
    },
    dma: {
        channelId: "required"
    },
    dmt: {
        channelId: "required",
        set: "required"
    },
    dmra: {
        channelId: "required"
    },
    drl: {
        type: "required",
        page: "required"
    },
    dar: {
        type: "required"
    },
    dr: {
        type: "required",
        channelId: "required"
    },
}

/**
 * 
 * @param {*} data 
 * @param {*} rules 
 */
 async function validation(data, rules) {
    return new Promise(async function (resolve, reject) {
        let validation  = new Validator(data, rules);
        if(validation.passes()) {
            resolve(true);
        } else {
            reject();
        }
    });
}

/**
 * 
 * @param {*} current 
 * @param {*} max 
 * @returns 
 */
 async function limitValidation(current, max) {
    return new Promise(async function (resolve, reject) {
        if(current < max) {
            resolve(true);
        } else {
            reject();
        }
    });
}

/**
 * 
 * @param {*} ws 
 * @desc limit 2/s
 */
 async function canSendMessage(ws) {
    return new Promise(async function (resolve, reject) {
        var now         = Date.now();
        var addTime     = new Date(new Date().getTime() + 500).getTime();
        var lastSent    = new Date(ws['canSend']).getTime();
        if(typeof ws['canSend'] !== "undefined" && lastSent !== "NaN" && now < lastSent) {
            reject();
        } else {
            ws['canSend'] = addTime;
            resolve();
        }
    });
}

/**
 * 
 * @param {*} ws 
 * @returns 
 */
async function rateLimitValidation(ws) {
    return new Promise(async function (resolve, reject) {
        utility.scoreLimit(ws).then(function() {
            utility.messageLimit(ws).then(function() {
                utility.checkSpamming(ws).then(function() {
                    resolve();
                }).catch(function(e) {
                    reject();
                });
            });
        });
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} channels 
 * @param {*} userChannelId 
 */
 async function banValidation(redis, channels, userChannelId) {
    return new Promise(async function (resolve, reject) {
        redmy.getBanChannels(redis, channels).then(function(bannedChannels) {
            if(Array.isArray(bannedChannels) && bannedChannels.includes(userChannelId)) {
                reject();
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    rules,
    validation,
    limitValidation,
    canSendMessage,
    rateLimitValidation,
    banValidation
}