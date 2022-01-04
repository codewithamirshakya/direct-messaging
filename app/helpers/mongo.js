var mongodb         = require("mongodb");
var ObjectID        = require('mongodb').ObjectID;
const config        = require('../config/default.js');

/**
 * 
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function message(channelId, userChannelId, position, q, reverse) {
    return new Promise(function (resolve, reject) {
        var limit   = config.chat.limit;
        var sort    = {_id: -1};

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
            sort    = {po: -1};
            params.po ={
                $gte: position
            };

            if(typeof reverse !== 'undefined' && reverse == true) {
                params.po = {
                    $lte: position
                }; 
            } else {
                sort    = {po: 1};
            }
        }

        resolve({
            query : params,
            sort: sort,
            limit: limit
        });
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
            "$match": { u: parseInt(userChannelId) }
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
                    ss: {$last: "$ss"},
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
async function seenCount(channelIds, userChannelId) {
    return new Promise(function (resolve, reject) {
        var match = {
            "$match": {
                u: {
                    $in: channelIds
                },
                c: parseInt(userChannelId),
                ss: {
                    $exists: false
                }    
            }
        };
        var group = {
            "$group" : {
                    _id: "$u",
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
    
/*
 * @param {*} channelId 
 * @param {*} userChannelId 
 */
async function conversation(channelId, userChannelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            $or: [{
                c: channelId,
                u: parseInt(userChannelId)
            }, {
                u: channelId,
                c: parseInt(userChannelId)
            }]
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} channelId 
 * @returns 
 */
async function messageList(channelId) {
    return new Promise(function (resolve, reject) {
        var params = {
            $or: [{
                c: parseInt(channelId),
            }, {
                u: parseInt(channelId)
            }]
        };

        resolve(params);
    });
}

/**
 * 
 * @param {*} id 
 * @returns 
 */
async function deleteById(id) {
    return new Promise(function (resolve, reject) {
        var params = {_id: new mongodb.ObjectID(id)};

        resolve(params);
    });
}

module.exports = {
    message,
    list,
    seenStatus,
    seenCount,
    conversation,
    messageList,
    deleteById
}