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

module.exports = {
    error,
    success,
    typeMessage,
    paginated
}