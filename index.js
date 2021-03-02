const mysql = require('mysql');


const connection = mysql.createConnection({

    //following param coming from aws lambda env variable 

    host: process.env.RDS_LAMBDA_HOSTNAME,

    user: process.env.RDS_LAMBDA_USERNAME,

    password: process.env.RDS_LAMBDA_PASSWORD,

    port: process.env.RDS_LAMBDA_PORT,

    // calling direct inside code  

    connectionLimit: 10,

    multipleStatements: true,

    // Prevent nested sql statements 

    connectionLimit: 1000,

    connectTimeout: 60 * 60 * 1000,

    acquireTimeout: 60 * 60 * 1000,

    timeout: 60 * 60 * 1000,

    debug: true

});


exports.handler = async (event) => {

    try {

        const data = await new Promise((resolve, reject) => {

            connection.connect(function (err) {

                if (err) {

                    reject(err);

                }

                connection.query('CREATE DATABASE testdb', function (err, result) {

                    if (err) {

                        console.log("Error->" + err);

                        reject(err);

                    }

                    resolve(result);

                });

            })

        });


        return {

            statusCode: 200,

            body: JSON.stringify(data)

        }


    } catch (err) {

        return {

            statusCode: 400,

            body: err.message

        }

    }

}; 



'use strict';

module.exports.hello = async function(event) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(
      {
        message: 'Hello World!',
        params: event.queryStringParameters,
        secret: process.env.A_VARIABLE
      },
      null,
      2
    ),
  };
};

