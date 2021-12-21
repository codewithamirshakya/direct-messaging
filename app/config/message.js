module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml",
            userList: "ul"
        }
    },
    response: {
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml",
            userList: "ul"
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