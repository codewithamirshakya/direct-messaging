/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
 async function exceptSelfAccess(channelId, userChannelId) {
    return new Promise(async function (resolve, reject) {
        if(channelId == userChannelId) {
            reject();
        } else {
            resolve();
        }
    });
}

module.exports = {
    exceptSelfAccess
}