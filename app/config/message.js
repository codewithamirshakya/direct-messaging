module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm",
            history: "dh",
            channelList: "dcl"
        }
    },
    response: {
        messaging: {
            send: "dm",
            history: "dh",
            channelList: "dcl"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            validation:     "DIRECT_MESSAGING_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE",
            history:        "DIRECT_MESSAGING_HISTORY"
        }
    },
    successCode : {

    },
};