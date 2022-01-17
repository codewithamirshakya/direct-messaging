const m             = require('../config/message.js');
const validator     = require('../helpers/validator.js');
const response      = require('../helpers/response.js');
const mrequest      = require('../models/mrequest.js');
const conversation  = require('../models/conversation.js');

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

module.exports = {
    accept
};