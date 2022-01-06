
const counter               = require('../models/counter.js');
const conversation          = require('../models/conversation.js');
const param                 = require('../helpers/param.js');
const mongo                 = require('../helpers/mongo.js');

const DM_COLLECTION         = 'dm';
const COUNTER_TYPE          = 'dm';

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

                            // Update Conversation
                            updateConversation(connection, params);
                            
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
 * @param {*} params 
 */
async function updateConversation(connection, params) {
    return new Promise(function (resolve, reject) {
        // update my conversation
        param.myConvo(params).then(function(myConvoParams) {
            var myClause  = mongo.myConvoClause(params.c, params.u);
            conversation.update(connection, { $set: myConvoParams } , myClause, { upsert: true });
        });

        // update their conversation
        param.theirConvo(params).then(function(theirConvoParams) {
            var theirClause  = mongo.theirConvoClause(params.c, params.u);
            conversation.update(connection, { $set: theirConvoParams } , theirClause, { upsert: true });
        });

        resolve();
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

/**
 * 
 * @param {*} connection 
 * @param {*} query 
 * @returns 
 */
 async function exist(connection, query) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION).findOne(query,function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    if(typeof result !== "null" && result) {
                        resolve(result);
                    } else {
                        reject();
                    }
                }
            });
        } catch(e) {
            reject();
        }
    });
}

/**
 * 
 * @param {*} connection 
 * @param {*} query 
 * @returns 
 */
 async function latest(connection, query) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION).findOne(query, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    if(typeof result !== "null" && result) {
                        resolve(result);
                    } else {
                        reject();
                    }
                }
            });
        } catch(e) {
            reject();
        }
    });
}

module.exports = {
    save,
    updateConversation,
    history,
    aggregate,
    update,
    remove,
    aggregateCon,
    exist,
    latest
}