"use strict";
console.log("testing")

/*
console.log({//TODO: Need to setup a dev mysql db
  config: {
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  },
})*/
var connection
//this will check if live on producion server. And change the db connection accordingly
if (Object.keys(process.env).includes("AWS_LAMBDA_FUNCTION_VERSION")) {
  connection = require("serverless-mysql")({
    config: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    },
  });
} else {
  connection = require("serverless-mysql")({//TODO: Need to setup a dev mysql db
    config: {
      database:"utopia",
      user: "admin",
      password: "password",
      host: "ahmed.cmj8spxpnzjj.us-east-2.rds.amazonaws.com",
      port: "3306",
    },
  });
}



module.exports = connection;
