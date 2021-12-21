module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml",
            userList: "ul"
        },
        emotes: {
            list: "el"
        }
    },
    response: {
        messaging: {
            send: "dm",
            history: "dch",
            messageList: "dml",
            userlist: "ul"
        },
        emotes: {
            list: "el"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            validation:     "DIRECT_MESSAGING_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE",
            history:        "DIRECT_MESSAGING_HISTORY",
            messageList:    "DIRECT_MESSAGING_LIST"
        },
        emojis: {
            list:           "EMOTES_LIST"
        },
        userlist: {
            list:   "USERLIST"
        }
    },
    successCode : {

    },
};