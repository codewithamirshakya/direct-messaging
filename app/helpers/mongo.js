var mongodb         = require("mongodb");
var ObjectID        = require('mongodb').ObjectID;
const config        = require('../config/default.js');

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function message(channelId, userChannelId, position, q, reverse, search) {
    return new Promise(function (resolve, reject) {
        var limit   = config.chat.conversation;
        var sort    = {_id: -1};

        var params = {            
            $or: [{
                c: parseInt(channelId),
                u: parseInt(userChannelId)
            }, {
                c: parseInt(userChannelId),
                u: parseInt(channelId)
            }]
        };

        if (typeof q !== 'undefined' && q != '') {
            params.m =  {$regex: new RegExp(q, 'i')};
        }

        if(typeof position !== 'undefined' && position != '') {
            sort    = {po: -1};
            params.po = {$gt: position};

            if(typeof reverse !== 'undefined' && reverse == true) {
                params.po = search == true ? {$lte: position} : {$lt: position}; 
            } else {
                sort    = {po: 1};
            }
        }

        resolve({
            query : params,
            sort: sort,
            limit: limit
        });
    });
}

/**
 * 
 * @param {*} userChannelId 
 */
 async function deliveredStatus(userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            c: parseInt(userChannelId)
        };

        params.dv = {
            $exists: false
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function seenStatus(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            c: parseInt(userChannelId),
            u: parseInt(channelId)
        };

        params.ss = {
            $exists: false
        };

        resolve(params);
    });
}
    
/*
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function conversation(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            c: parseInt(channelId),
            u: parseInt(userChannelId)
        };

        resolve(params);
    });
}

/*
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function request(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            c: parseInt(channelId),
            u: parseInt(userChannelId)
        };

        resolve(params);
    });
}

/*
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function directMessage(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            $and: [
                {
                    $or: [{
                        c: parseInt(channelId),
                        u: parseInt(userChannelId)
                    }, {
                        c: parseInt(userChannelId),
                        u: parseInt(channelId)
                    }]
                },
                {
                    ir: {
                        $exists: false
                    }
                }
            ]
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} channelId 
 * @returns 
 */
async function messageList(channelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            u: parseInt(channelId)
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 * @returns 
 */
 async function remove(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            $or: [{
                c: parseInt(channelId),
                u: parseInt(userChannelId)
            }, {
                c: parseInt(userChannelId),
                u: parseInt(channelId)
            }]
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} id 
 * @returns 
 */
async function deleteById(id) {
    return new Promise(function (resolve, reject) {
        var params = {_id: new mongodb.ObjectID(id)};

        resolve(params);
    });
}

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 * @returns 
 */
 function myConvoClause(channelId, userChannelId) {
    var clause = {
        c: parseInt(channelId),
        u: parseInt(userChannelId)
    };

    return clause;
}

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 * @returns 
 */
function theirConvoClause(channelId, userChannelId) {
    var clause = {
        u: parseInt(channelId),
        c: parseInt(userChannelId)
    };

    return clause;
}

/**
 * 
 * @param {*} channelId 
 * @param {*} messageId 
 * @returns 
 */
function selfMessage(channelId, userChannelId, messageId) {
    var clause = {
        c: parseInt(channelId),
        u: parseInt(userChannelId),
        _id: new mongodb.ObjectID(messageId)
    };

    return clause;
}

module.exports = {
    message,
    deliveredStatus,
    seenStatus,
    conversation,
    request,
    directMessage,
    messageList,
    remove,
    deleteById,
    myConvoClause,
    theirConvoClause,
    selfMessage
}