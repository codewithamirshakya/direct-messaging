
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
async function seenStatus(channelId, userChannelId) {
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

        params.ss ={
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

async function list1(userChannelId, q) {
    return new Promise(function (resolve, reject) {
        var params = [
            { $match: {$or: [{ u: parseInt(userChannelId) },{c:parseInt(userChannelId)}]} },
            { $lookup: { from: "channels", localField: "c", foreignField: "channel_id", as: "channel" } },
            { $lookup: { from: "channels", localField: "u", foreignField: "channel_id", as: "userChannel" } },
            {
                $lookup:
                {
                    from: "dm",
                    let: { ch: "$c", uh: "$u" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and: [
                                        {
                                            $or: [
                                                {
                                                    $and:
                                                        [
                                                            { $eq: ["$c", "$$ch"] },
                                                            { $eq: ["$u", "$$uh"] }
                                                        ]
                                                },
                                                {
                                                    $and:
                                                        [
                                                            { $eq: ["$c", "$$uh"] },
                                                            { $eq: ["$u", "$$ch"] }
                                                        ]
                                                }
                                            ]
                                        },
                                        {
                                            s: false
                                        }
                                    ]
        
                                }
                            }
                        }
                    ],
                    as: "uncd"
                }
            },
            {
                $addFields: { unc: { $size: "$uncd" } }
        
            }        
        ];
        resolve(params);
    });
}

/**
 * 
 * @param {*} userChannelId 
 * @param {*} q 
 * @returns 
 */
async function list(userChannelId, q) {
    return new Promise(function (resolve, reject) {
        var match = { 
            "$match": { 
                "$or": [
                    { u: parseInt(userChannelId) }, 
                    { c: parseInt(userChannelId) }
                ] 
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
                    id: {$last: "$_id"},
                    u: {$last: "$u"},
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

/**
 * 
 * @param {*} userChannelId 
 * @param {*} q 
 * @returns 
 */
async function seenCount(channelIds) {
    return new Promise(function (resolve, reject) {
        var match = {
            "$match": {
                c: {
                    $in: channelIds
                },
                s: {
                    $exists: false
                }    
            }
        };
        var group = {
            "$group" : {
                    _id: "$c",
                    us: { $sum: 1 }
                }
            };
            

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
    seenStatus,
    seenCount
}