const CONVO_COLLECTION = 'conversation';

/**
 * 
 * @param {*} connection 
 * @param {*} query 
 */
async function get(connection, query, sort, skip, limit) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(CONVO_COLLECTION)
                        .find(query)
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .toArray(function(err, result) {
                            if(typeof result !== "null" && result) {
                                resolve(result);
                            } else {
                                reject();
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
 * @param {*} query 
 * @param {*} params 
 * @param {*} options 
 * @returns 
 */
async function update(connection, query, params, options) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(CONVO_COLLECTION).updateOne(query, params, options);
            
            resolve();
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
async function findOne(connection, query) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(CONVO_COLLECTION).findOne(query,function(err, result) {
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
 * @param {*} q 
 * @param {*} params 
 * @returns 
 */
 async function remove(connection, q) { 
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(CONVO_COLLECTION)
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
    get,
    update,
    findOne,
    remove
}