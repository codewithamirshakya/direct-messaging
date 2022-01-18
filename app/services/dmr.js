const m             = require('../config/message.js');
const config        = require('../config/default.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const mrequest      = require('../models/mrequest.js');
const mongo         = require('../helpers/mongo.js');
const dm            = require('../models/dm.js');
const conversation  = require('../models/conversation.js');

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
async function accept(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        // Validate Input
        validator.validation(inputJSON, validator.rules.dmr).then(function() {
            let query = {c: parseInt(inputJSON.channelId), u: parseInt(initialJSON.userChannelId)}; 
            
            // Find Request
            mrequest.findOne(initialJSON.mongoConnection,query).then((result) => {
                delete result._id;

                // Move to Conversation
                conversation.update(initialJSON.mongoConnection, query, {$set: result}, {upsert: true}).then(() => {
                    // Remove Request
                    mrequest.remove(initialJSON.mongoConnection, query);

                    // Prepare Response
                    response.typeMessage(m.response.messaging.requestAccept, {c: inputJSON.channelId}).then(function(message) {
                        resolve(message);
                    }).catch(e => {console.log(e);reject(response.error(m.errorCode.messaging.requestAccept));});
                }).catch(e => {reject(response.error(m.errorCode.messaging.requestAccept));});         
            }).catch(e => {console.log(e);reject(response.error(m.errorCode.messaging.requestAccept));})
        }).catch(function(e) {            
            reject(response.error(m.errorCode.messaging.requestAccept));
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
                    // Prepare Response
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

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function deleteMessageRequest(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        validator.validation(inputJSON, validator.rules.dr).then(function() {
            let params = {u: parseInt(initialJSON.userChannelId), c: parseInt(inputJSON.channelId)};
            mrequest.removeMany(initialJSON.mongoConnection, params)
            .then((res) => {
                response.typeMessage(m.response.messaging.deleteRequest, {c: inputJSON.channelId})
                    .then((message) => {
                        resolve(message);
                    })
                    .catch(e => {reject(response.error(m.errorCode.messaging.deleteRequest))});
            })
            .catch(e => {reject(response.error(m.errorCode.messaging.deleteRequest));});
        });
    });
}

/**
 * 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 */
async function deleteAllMessageRequest(initialJSON, inputJSON) {
    return new Promise(async function (resolve, reject) {
        validator.validation(inputJSON, validator.rules.dar).then(function() {
            let params = {u: parseInt(initialJSON.userChannelId)};
            mrequest.removeMany(initialJSON.mongoConnection, params)
            .then((res) => {
                response.typeMessage(m.response.messaging.daRequest)
                .then((message) => {
                    resolve(message);
                })
                .catch(e => {reject(response.error(m.errorCode.messaging.deleteRequest))});
            })
            .catch(e => {reject(response.error(m.errorCode.messaging.deleteRequest))});
        });
    });
}

module.exports = {
    accept,
    messageList,
    deleteMessageRequest,
    deleteAllMessageRequest
};