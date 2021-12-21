
/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function message(channelId, userChannelId, position) {
    return new Promise(function (resolve, reject) {

        var params = {
            po: {
                $lte: position
            },
            $or: [{
                c: parseInt(channelId),
                u: parseInt(userChannelId)
            }, {
                c: parseInt(userChannelId),
                u: parseInt(channelId)
            }]
        }

        resolve(params);
    });
}

/**
 * 
 * @param {*} userChannelId 
 * @returns 
 */
async function list(userChannelId) {
    return new Promise(function (resolve, reject) {
        var  params = [
            {
                "$match" : {
                    u: parseInt(userChannelId)
                }
            },
            {
                "$group" : {
                        _id: "$c", 
                        rn: {$last: "$rn"}, 
                        n:  {$last: "$n"}, 
                        m:  {$last: "$m"}, 
                        d:  {$last: "$d"}, 
                        y:  {$last: "$y"},
                        i:  {$last: "$i"}, 
                        id: {$last: "$_id"}
                    }
                }
        ];  
        resolve(params);
    });
}

module.exports = {
    message,
    list
}