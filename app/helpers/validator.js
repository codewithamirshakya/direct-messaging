const Validator     = require('validatorjs'); 
const utility       = require('../helpers/utility.js');

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
        type: "required"
    },
    ss: {
        type: "required",
        channelId: "required",
        position: "required"
    }
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

module.exports = {
    rules,
    validation,
    canSendMessage,
    rateLimitValidation
}