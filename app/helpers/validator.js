const path          = require('path');
const Validator     = require('validatorjs'); 
const m             = require('../config/message.js');
const config        = require('../config/default.js');

const rules = {
    dm: {
        type: "required",
        message: "required"
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