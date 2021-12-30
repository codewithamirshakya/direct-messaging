const counter               = require('../models/counter.js');
const conversation          = require('../models/conversation.js');

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
            counter.getLatestCounterByType(connection,{type: 'dm'}).then(function(result) {
                params.po = result.sequence_value;
                connection.collection(DM_COLLECTION).insertOne(params, function(err, res) {
                    if (err) {
                        console.log(err);
                    }
                    
                    if(typeof res !== "undefined" && res.insertedId !== "undefined") {
                        counter.updateLatestCounterByType(connection,{type: 'dm'},{$set: {sequence_value: result.sequence_value + 1 }}).then(function() {
                            const query = {
                                $or: [{
                                    c: params.c,
                                    u: params.u
                                }, {
                                    u: params.c,
                                    c: params.u
                                }]
                            };
                            conversation.save(connection, { $set: {c: params.c, u: params.u, m: params.m} } ,query, { upsert: true });
                            resolve(res.insertedId);
                        });
                    } else {
                        resolve();
                    }
                });
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
async function history(connection, q, limit, sort) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(DM_COLLECTION)
                        .find(q)
                        .sort(sort)
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
                        .deleteMany(q, function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                            
                            if(typeof res !== "undefined" && res.insertedId !== "undefined") {
                                resolve(res.deletedCount);
                            } else {
                                resolve();
                            }
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
    remove
}