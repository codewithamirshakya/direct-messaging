const m             = require('../config/message.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const mrequest      = require('../models/mrequest.js');
const conversation  = require('../models/conversation.js');
const config        = require('../config/default.js');
const mongo         = require('../helpers/mongo.js');

async function accept(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dmr).then(function() {
            let query = {c: parseInt(inputJSON.channelId), u: parseInt(initialJSON.userChannelId)};
            mrequest.findOne(initialJSON.mongoConnection,query).then((result) => {
                delete result._id;
                conversation.update(initialJSON.mongoConnection, query, {$set: result}, {upsert: true}).then(() => {
                    mrequest.remove(initialJSON.mongoConnection, query);

                    response.typeMessage(m.response.messaging.requestaccept, {c: inputJSON.channelId}).then(function() {
                        resolve(true);
                    }).catch(e => {reject(response.error(m.errorCode.messaging.requestaccept));});
                }).catch(e => {reject(response.error(m.errorCode.messaging.requestaccept));});         
            }).catch(e => {reject(response.error(m.errorCode.messaging.requestaccept));})
        }).catch(function(e) {            
            reject(response.error(m.errorCode.messaging.requestaccept));
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function messageList(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.drl).then(function() {
            // Mongo Query Param
            mongo.messageList(initialJSON.userChannelId).then(function(params) {
                // Limit Pagination
                var limit    = config.chat.limit;   
                var skip     = (inputJSON.page - 1) * config.chat.limit; 
                var sort     = {d: -1};
                // Get Conversation
                mrequest.get(initialJSON.mongoConnection, params, sort, skip, limit).then(function(results) {

                    response.paginated(m.response.messaging.requestlist, results, inputJSON.page, inputJSON.q).then(function(message) {
                        resolve(message);
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.requestList));
                    });
                }).catch(function(e) {
                    // Prepare Response
                    response.paginated(m.response.messaging.requestlist, [], inputJSON.page, inputJSON.q).then(function(message) {
                        resolve(message);
                    }).catch(function(e) {
                        reject(response.error(m.errorCode.messaging.requestList));
                    });
                });
            }).catch(function(e) {
                reject(response.error(m.errorCode.messaging.requestList));
            });
        }).catch(function(e) {
            reject(response.error(m.errorCode.messaging.requestList));
        });
    });
}

module.exports = {
    accept,
    messageList
};