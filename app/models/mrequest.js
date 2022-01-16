const MREQUEST_COLLECTION = 'mrequest';

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
            connection.collection(MREQUEST_COLLECTION).updateOne(query, params, options);
            
            resolve();
        } catch(e) {
            reject();
        }
    });
}

module.exports = {
    update
}