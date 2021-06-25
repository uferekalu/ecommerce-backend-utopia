require("dotenv").config()
;("use strict")

let connection

if (process.env.PRODUCTION) {
    connection = require("serverless-mysql")({
        config: {
            database: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
        },
    })
}

if (!process.env.PRODUCTION) {
    connection = require("serverless-mysql")({
        config: {
            database: "utopia",
            user: "admin",
            password: "TY8jGx6x23",
            host: "utopia-db-dev.cmj8spxpnzjj.us-east-2.rds.amazonaws.com",
            port: "3306",
        },
    })
}

module.exports = connection
