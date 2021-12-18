
/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function message(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            $or: [{
                c: channelId.toString(),
                u: userChannelId.toString()
            }, {
                c: userChannelId.toString(),
                u: channelId.toString()
            }]
        };

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
                    u: userChannelId.toString()
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