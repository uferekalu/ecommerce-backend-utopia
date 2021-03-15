const parser = require("body-parser-for-serverless");
const handler = require('../handler')

exports.handler = async (event, context) => {
    const body = await parser(event);
    var api_name = 'User create'
    const data = {
        user_first_name: "aa",
        user_middle_name: "aa",
        user_last_name: "aa",
        user_dob: "aa",
        user_gender: "aa",
        user_email: "aa",
        user_password: "aa",
        user_datetime_created: "aa",
        id_user_status: 1,
        id_user_access_level: 0,
        id_user_title: 1,
    }
    const result = await handler.db_insert(data)//this creates the query and processes // returns [success bool,data object]
    return handler.returner(result,api_name)//Sends response to caller - Must be at bottom of handler
};