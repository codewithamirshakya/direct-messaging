const DM_COLLECTION = 'conversation';

/**
 * 
 * @param {*} connection 
 * @param {*} params 
 * @param {*} query 
 * @param {*} options 
 * @returns 
 */
async function save(connection, params, query, options) {
    return new Promise(function (resolve, reject) {
        try {
            const result = connection.collection(DM_COLLECTION).updateOne(query, params, options);
            resolve();
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

module.exports = {
    save,
    exist
}