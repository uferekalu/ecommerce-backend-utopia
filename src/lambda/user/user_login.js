const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const token = require('../../middleware/verify_token')
const bcrypt = require('bcryptjs');
const qs = require('querystring')


const api_name = "User login"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        const user_exist = await db.search_one( "users","user_email",body.user_email)
        
        if (user_exist.length == 0)
            return handler.returner([false, { message: "User is not found" }], api_name, 404)
     
       const pass_valid = await bcrypt.compare(body.user_password, user_exist[0].user_password);
        if (!pass_valid)
            return handler.returner([false, { message: "Password is invalid" }], api_name, 400)

        if(user_exist[0].email_verified != 1)
        return handler.returner([false, { message: "Account is not verified" }], api_name, 400)

        const created_token = await token.create_token(user_exist[0].id_user)
  
        let data = {
            id_user: user_exist[0].id_user,
            token: created_token,
            ut_datetime_created: await handler.datetime()
        }

        const result = await db.insert_new(data, "user_tokens");
        return handler.returner([true, { token: created_token, user_access_level: user_exist[0].id_user_access_level }], api_name, 201)
   
    } catch (e) {
        console.log("Error: ",e)
        return handler.returner([false, e], api_name)
    }
};