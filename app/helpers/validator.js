const Validator     = require('validatorjs'); 

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

module.exports = {
    rules,
    validation
}