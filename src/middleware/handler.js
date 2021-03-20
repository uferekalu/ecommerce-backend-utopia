var mysql = require("mysql");
const connection = require('../lib/database/db_connection')

exports.returner = async (result, api_name, statusCode) => {
    return await {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify(
            {
                success: result[0], api: api_name, data: result[1]
            },
        ),
    };
}

exports.datetime = async () => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}



exports.url_to_json = async (url) => {
    var hash;
    var myJson = {};
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        myJson[hash[0]] = hash[1];
    }
    return myJson;
}