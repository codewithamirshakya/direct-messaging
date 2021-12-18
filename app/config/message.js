module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml"
        }
    },
    response: {
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            validation:     "DIRECT_MESSAGING_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE",
            history:        "DIRECT_MESSAGING_HISTORY",
            messageList:    "DIRECT_MESSAGING_LIST"
        }
    },
    successCode : {

    },
};