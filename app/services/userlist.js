const m             = require('../config/message.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const channel       = require('../models/channel.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON
 * @returns 
*/
async function list(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validation
        validator.validation(inputJSON, validator.rules.ul).then(function() {
            // Get Userlist
            channel.getFollowings(initialJSON.mysqlConnection,initialJSON.userChannelId, inputJSON.q).then(function(followings) {
                // Format Userlist
                response.formatUserlist(followings).then(function(followings) {
                    // Prepare Response
                    response.paginated(m.response.messaging.userlist, followings, true).then(function(message) {
                        resolve(message);
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.userlist.list));
                    });
                });                
            });
        });
    });
}

module.exports = {
    list
}