const COUNTER_COLLECTION = 'counters';

/**
 * 
 * @param {*} connection 
 * @param {*} q 
 * @returns 
 */
async function getLatestCounterByType(connection, q) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(COUNTER_COLLECTION)
                        .findOne(q,function(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
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
async function updateLatestCounterByType(connection, q, params) {
    return new Promise(function (resolve, reject) {
        try {
            connection.collection(COUNTER_COLLECTION)
                        .updateOne(q, params, function(err, res) {
                            if (err) {
                                reject();
                            };
                            
                            resolve(res);
                        });
        } catch(e) {
            reject();
        }
    });
}

module.exports = {
    getLatestCounterByType,
    updateLatestCounterByType
}