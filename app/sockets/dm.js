const nJwt          = require('njwt');
const uWS           = require('uWebSockets.js');
const config        = require('../config/default.js');
const m             = require('../config/message.js');
const response      = require('../helpers/response.js');
const util          = require('../utils/default.js');
const ma            = require('../actions/dm.js');
const setting       = require('../models/setting.js');
const redmy         = require('../helpers/redmy.js');

let redisClient;
let redisSub;
let redisPub;
let mongoConnection;
let mysqlConnection;

var socket = {
    /* Options */
    compression:        uWS.SHARED_COMPRESSOR,
    maxPayloadLength:   config.socket.maxPayloadLength,
    idleTimeout:        config.socket.idleTimeout,
    maxBackpressure:    config.socket.maxBackpressure,

    /* Handlers */
    upgrade: (res, req, context) => {
        /* This immediately calls open handler, you must not use res after this call */
        res.upgrade({
            url: req.getUrl()
        },
        /* Spell these correctly */
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context);

        //console.log(req.getHeader("x-forwarded-for"));
    },
    open: (ws) => {
        _open(ws);
    },
    message: (ws, message, isBinary) => {
        _message(ws, message, isBinary);
    },
    drain: (ws) => {
        /*if(ws.getBufferedAmount() > 0) {
            console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
        }*/
    },
    close: (ws, code, message) => {
        _close(ws, code, message);
    }
};

/**
 * 
 * @param {*} ws 
 */
 function _open(ws) {
    try {
        // Query Param
        var queryparam  = ws.url.substr(9);
        var token       = util.queryParamValue(queryparam, "token");

        // Decode jwt
        var verifiedJwt = nJwt.verify(token, config.jwt.key, config.jwt.algorithm);
        var data        = verifiedJwt.body;

        // In case of Guest Mode, chat message should still appear
        if(typeof data.userChannelId !== "undefined" && data.userChannelId > 0) {
            var messageAdapter     = util.pubSubKey(data.userChannelId);

            // Redis Subscribe
            redisSub.subscribe(messageAdapter);

            // Socket Subscribe
            ws.subscribe(messageAdapter);

            // Store Channel Online
            setting.updateOnlineDmSetting(mysqlConnection, parseInt(data.userChannelId), true);

            // Store User Info
            storeConnectedUser(ws, data, messageAdapter).then(function() {

            });
        }
    } catch(e) {
        try {
            ws.send(response.error(m.errorCode.jwt));
        } catch(e) {

        }
    }
}

/**
 * 
 * @param {*} ws 
 * @param {*} message 
 * @param {*} isBinary 
 */
 function _message(ws, message, isBinary) 
 {
     try {
        const buffer        = Buffer.from(message);
        var string          = buffer.toString();
        var inputJSON       = JSON.parse(string);
        var initialJSON     = getConnectedUser(ws);
         
        ma.action(initialJSON, inputJSON, ws).then(function(message) {
            if(typeof message !== "undefined" && message.length > 0) {
                // Send through Socket
                try {
                    ws.send(message);
                } catch(e) {

                }
            }
        }).catch(function(e) {
            if(typeof e !== "undefined") {
                try {
                    ws.send(e);
                } catch(e) {

                }
            }
        });
     } catch(e) {
         
     }
 }
 
 /**
  * 
  * @param {*} ws 
  * @param {*} code 
  * @param {*} message 
  */
 function _close(ws, code, message) {
    // Store Channel Online
    setting.updateOnlineDmSetting(mysqlConnection, parseInt(ws['u']), false);

    // Cleanup Socket Inactive
    cleanupSocketInactive(ws);
 }

 /**
  * 
  * @param {*} ws 
  */
 function cleanupSocketInactive(ws) {
    if(typeof ws !== "undefined" && typeof ws['ac'] !== "undefined" && Array.isArray(ws['ac'])) {
        var userChannelId   = ws['u'];
        var stillActive     = ws['ac'];

        stillActive.forEach(ac => {
            redmy.conInactive(redisClient, ac, userChannelId);
        });
    }
 }

 /**
 * 
 * @param {*} ws 
 * @param {*} info 
 * @param {*} routingKey 
 */
function storeConnectedUser(ws, info, adapter) {
    return new Promise(async function (resolve, reject) {
        ws["r"]         = adapter;
        ws["c"]         = info.channelId.toString();
        ws["u"]     = info.userChannelId.toString();
        ws["n"]       = info.displayName;
        ws["cn"]       = info.channelName;
        ws["cl"]             = info.color;
        ws["i"]            = info.avatar;
        ws["y"]       = info.accountType;
        ws["k"]     = info.nicknameColor;
        ws["tl"]          = info.subTitle;
        ws["b"]        = info.subscriber;
        ws["f"]          = info.follower;
        ws["s"]          = info.streamer;
        ws["o"]            = info.online;
        ws["d"]    = info.registeredDate;
        ws["l"]              = info.lang;
        ws["a"]             = info.admin;
        ws["v"]          = info.verified;

        resolve();
    });
}

/**
 * 
 * @param {*} ws 
 */
function getConnectedUser(ws) {
    var initialJSON     = {
        redis           : redisClient,
        redisPub        : redisPub,
        mongoConnection : mongoConnection,
        mysqlConnection : mysqlConnection,
        channelId       : ws["c"],
        userChannelId   : ws["u"],
        routingKey      : ws["r"],
        displayName     : ws["n"],
        channelName     : ws["cn"],
        color           : ws["cl"],
        avatar          : ws["i"],
        accountType     : ws["y"],
        nicknameColor   : ws["k"],
        subTitle        : ws["tl"],
        subscriber      : ws["b"],
        follower        : ws["f"],
        streamer        : ws["s"],
        online          : ws["o"],
        registeredDate  : ws["d"],
        lang            : ws["l"],
        admin           : ws["a"],
        bot             : false,
        verified        : ws["v"]
    };

    return initialJSON;
}

/**
 * 
 * @param {*} connection 
 */
 function setRedis(client) {
    redisClient = client;
}

/**
 * 
 * @param {*} sub 
 */
 function setRedisPub(pub) {
    redisPub = pub;
}

/**
 * 
 * @param {*} sub 
 */
function setRedisSub(sub) {
    redisSub = sub;
}

/**
 * 
 * @param {*} conn 
 */
function setMongo(conn) {
    mongoConnection = conn;
}

/**
 * 
 * @param {*} conn 
 */
 function setMysql(conn) {
    mysqlConnection = conn;
}

module.exports = {
    socket,
    setRedis,
    setRedisPub,
    setRedisSub,
    setMongo,
    setMysql
}