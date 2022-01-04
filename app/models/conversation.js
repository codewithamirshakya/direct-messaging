const CONVO_COLLECTION = 'conversation';

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @param {*} query 
 * @param {*} options 
 * @returns 
 */
async function update(connection, params, query, options) {
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
async function exist(connection, query) {
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

module.exports = {
    update,
    exist
}