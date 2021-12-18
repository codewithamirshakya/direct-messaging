const config        = require('../config/default.js');

const DM_COLLECTION = 'dm';

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @returns 
 */
async function save(connection, params) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION).insertOne(params, function(err, res) {
                if (err) {
                    console.log(err);
                }
                
                if(typeof res !== "undefined" && res.insertedId !== "undefined") {
                    resolve(res.insertedId);
                } else {
                    resolve();
                }
            });
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} initialJSON 
 * @param {*} inputJSON 
 * @returns 
 */
async function history(connection, initialJSON, inputJSON) {
    var params = {
        $or: [{
            c: inputJSON.channelId,
            u: initialJSON.userChannelId.toString()
        }, {
            c: initialJSON.userChannelId.toString(),
            u: inputJSON.channelId
        }]
    };

    var limit   = inputJSON.page * config.chat.limit;
    var skip    = (inputJSON.page - 1) * limit;     

    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .find(params)
                        .sort({_id: -1})
                        .skip(skip)
                        .limit(limit)
                        .toArray(function(err, result) {
                            if (err) {
                                console.log(err);
                            }
                            
                            resolve(result);
                        });
        } catch(e) {
            resolve();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @param {*} limit 
 * @param {*} skip
 * @returns 
 */
async function aggregate(connection, params, limit, skip) { 

    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .aggregate(params)
                        .sort({_id: -1})
                        .skip(skip)
                        .limit(limit)
                        .toArray(function(err, result) {
                            if (err) {
                                console.log(err);
                            }
                            
                            resolve(result);
                        });
        } catch(e) {
            resolve();
        }
    });
}

module.exports = {
    save,
    history,
    aggregate
}