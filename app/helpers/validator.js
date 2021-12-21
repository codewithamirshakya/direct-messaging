const Validator     = require('validatorjs'); 

const rules = {
    dm: {
        type: "required",
        message: "required",
        channelId: "required"
    },
    dh: {
        type: "required",
        channelId: "required",
        position: "required"
    },
    dcl: {
        type: "required",
        page: "required"
    },
    ul: {
        type: "required"
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

module.exports = {
    rules,
    validation
}