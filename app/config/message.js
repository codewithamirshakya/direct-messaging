module.exports = {
    type: {
        system: {

        },
        messaging: {
            send: "dm"
        }
    },
    response: {
        messaging: {
            send: "dm"
        }
    },
    errorCode: {
        jwt:                "JWT_TOKEN",
        messaging:  {
            validation:     "DIRECT_MESSAGING_VALIDATION",
            save:           "DIRECT_MESSAGING_SAVE"
        }
    },
    successCode : {

    },
};