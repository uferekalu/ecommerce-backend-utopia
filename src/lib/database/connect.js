"use strict"
require("dotenv").config()
console.log(`DB NAME: ${process.env.DB_NAME}`)

const connection = require("serverless-mysql")({
    config: {
        BASE_URL: 'localhost:3000/api',
        database: 'utopia',
        user: 'admin',
        password: 'TY8jGx6x23',
        host: 'utopia-db-dev.cmj8spxpnzjj.us-east-2.rds.amazonaws.com',
        port: '3306'
    },
})

module.exports = connection
