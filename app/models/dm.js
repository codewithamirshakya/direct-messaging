
const counter               = require('../models/counter.js');
const conversation          = require('../models/conversation.js');

const DM_COLLECTION         = 'dm';
const COUNTER_TYPE          = 'dm';

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 * @returns 
 */
function convoClause(channelId, userChannelId) {
    var clause = {
        $or: [{
            c: channelId,
            u: userChannelId
        }, {
            u: channelId,
            c: userChannelId
        }]
    };

    return clause;
}

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @returns 
 */
async function save(connection, params) {
    return new Promise(function (resolve, reject) {
        try {
            // get auto incremental id
            counter.getLatestCounterByType(connection, { type: COUNTER_TYPE }).then(function(result) {
                if(typeof result !== "undefined") {
                    // assign incremental id
                    params.po            = result.sequence_value;

                    // insert dm
                    connection.collection(DM_COLLECTION).insertOne(params, function(err, res) {
                        if(typeof res !== "undefined" && res.insertedId !== "undefined") {
                            // update counter value
                            counter.updateLatestCounterByType(connection, { type: COUNTER_TYPE }, { $set: { sequence_value: result.sequence_value + 1 }});

                            // prepare update clause and params
                            var clause          = convoClause(params.c, params.u);
                            var updateParam     = JSON.parse(JSON.stringify(params));
                            if(typeof updateParam._id !== "undefined") {
                                delete updateParam._id;
                            }

                            // update conversation with the latest message
                            conversation.update(connection, { $set: updateParam } , clause, { upsert: true });

                            // resolve insertedId
                            resolve(res.insertedId);
                        } else {
                            reject();
                        }
                    });
                } else {
                    reject();
                }
            }).catch(function(e) {
                reject();
            });
        } catch(e) {
            reject();
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
async function history(connection, q) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .find(q.query)
                        .sort(q.sort)
                        .limit(q.limit)
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

async function aggregateCon(connection, params, limit, skip) { 
    return new Promise(function (resolve, reject) {
        try {
            connection.collection('conversation')
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

/**
 * 
 * @param {*} connection 
 * @param {*} q 
 * @param {*} params 
 * @returns 
 */
async function update(connection, q, params) { 
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .updateMany(q,params, function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                            
                            if(typeof res !== "undefined" && res.insertedId !== "undefined") {
                                resolve(res.modifiedCount);
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
 * @param {*} q 
 * @param {*} params 
 * @returns 
 */
async function remove(connection, q) { 
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .deleteOne(q, function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                            
                            resolve();
                        });
        } catch(e) {
            resolve();
        }
    });
}

module.exports = {
    save,
    history,
    aggregate,
    update,
    remove,
    aggregateCon
}