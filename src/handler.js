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
