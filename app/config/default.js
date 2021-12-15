module.exports = {
    server: {
        port: parseInt(process.env.PORT) || 9001
    },
    socket: {
        compression: process.env.SOCKET_COMPPRESSION || 0,
        maxPayloadLength: process.env.SOCKET_MAX_PAYLOAD_LENGTH || 64 * 1024, // 2KB
        idleTimeout: process.env.SOCKET_IDLE_TIMEOUT || 0, // 100s
        maxBackpressure: process.env.SOCKET_MAX_BACKPRESSURE || 104448,
        prefix: process.env.SOCKET_PREFIX || 'dm_'
    },
    mongo: {
        host: process.env.MONGO_DB_HOST || "localhost",
        port: process.env.MONGO_PORT || "27017",
        user: process.env.MONGO_DB_USERNAME || "root",
        pass: process.env.MONGO_DB_PASSWORD || "root",
        db:  process.env.MONGO_DB_DATABASE || "picarto",
        connection: process.env.CONNECTION_LIMIT || 1
    },
    jwt: {
        key: process.env.JWT_KEY || "DiaG0N12OhKTdglPqS",
        algorithm: process.env.JWT_ALGORITHM || "HS256"
    },
    log: {
        level: process.env.LOG_LEVEL || "LEVEL_1", // ALL, WARNINGS, INFO, DEBUG, ERROR, LEVEL_1, LEVEL_2, LEVEL_3
    }
};