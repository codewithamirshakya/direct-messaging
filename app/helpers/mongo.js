
/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function message(channelId, userChannelId, position, q, reverse) {
    return new Promise(function (resolve, reject) {

        var params = {            
            $or: [{
                c: parseInt(channelId),
                u: parseInt(userChannelId)
            }, {
                c: parseInt(userChannelId),
                u: parseInt(channelId)
            }]
        };

        if (typeof q !== 'undefined' && q != '') {
            params.m =  {$regex: new RegExp(q, 'i')};
        }

        if(typeof position !== 'undefined' && position != '') {
            params.po ={
                $gte: position
            };

            if(typeof reverse !== 'undefined' && reverse == true) {
                params.po ={
                    $lte: position
                }; 
            }
        }

        resolve(params);
    });
}

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function seenStatus(channelId, userChannelId, position) {
    return new Promise(function (resolve, reject) {

        var params = {            
            $or: [{
                c: parseInt(channelId),
                u: parseInt(userChannelId)
            }, {
                c: parseInt(userChannelId),
                u: parseInt(channelId)
            }]
        };

        if(typeof position !== 'undefined' && position != '') {
            params.po ={
                $lte: position
            };
        }

        params.s ={
            $exists: false
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} userChannelId 
 * @returns 
 */
async function list(userChannelId, q) {
    return new Promise(function (resolve, reject) {
        var match = {
            "$match" : {
                u: parseInt(userChannelId)
            }
        };
        var group = {
            "$group" : {
                    _id: "$c",
                    n:  {$last: "$n"}, 
                    m:  {$last: "$m"}, 
                    d:  {$last: "$d"}, 
                    y:  {$last: "$y"},
                    i:  {$last: "$i"}, 
                    rn: {$last: "$rn"},
                    ri: {$last: "$ri"},
                    ry: {$last: "$ry"},
                    id: {$last: "$_id"}
                }
            };

        if(typeof q !== 'undefined' && q != '') {
            match["$match"].m = {$regex: new RegExp(q, 'i')};
        }    

        var  params = [
            match,
            group
        ];  
        resolve(params);
    });
}

module.exports = {
    message,
    list,
    seenStatus
}