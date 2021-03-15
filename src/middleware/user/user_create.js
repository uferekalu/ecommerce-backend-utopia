const parser = require("body-parser-for-serverless");
const handler = require('../handler')

exports.handler = async (event, context) => {
    try {
        var datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const body = event
        var api_name = 'User create'
        const data = {
            user_first_name: body.user_first_name,
            user_middle_name: body.user_middle_name,
            user_last_name: body.user_last_name,
            user_dob: body.user_dob,
            user_gender: body.user_gender,
            user_email: body.user_email,
            user_password: body.user_password,
            user_datetime_created: datetime,
            id_user_status: 1,
            id_user_access_level: 0,
            id_user_title: 1,
        }
        const result = await handler.db_insert(data)//this creates the query and processes // returns [success bool,data object]
        return handler.returner(result, api_name)//Sends response to caller - Must be at bottom of handler
    } catch (e) {
        return handler.returner([false, e], api_name)
    }
};