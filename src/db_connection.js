"use strict";
console.log("testing")


console.log({//TODO: Need to setup a dev mysql db
  config: {
    database: process.env.DB_NAME,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
  },
})
var connection
//this will check if live on producion server. And change the db connection accordingly
if (Object.keys(process.env).includes("AWS_LAMBDA_FUNCTION_VERSION")) {
  connection = require("serverless-mysql")({
    config: {
      database: process.env.DB_NAME,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
    },
  });
} else {
  connection = require("serverless-mysql")({//TODO: Need to setup a dev mysql db
    config: {
      database: process.env.DB_NAME,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
    },
  });
}



module.exports = connection;
