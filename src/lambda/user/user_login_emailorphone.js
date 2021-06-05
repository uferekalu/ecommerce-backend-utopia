const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")
const bcrypt = require("bcryptjs")
const qs = require("querystring")
// will get post req with user_email or phone number  as user_id, type(email or phone number) and user_password
//------TODO
//-----currently sending plain text user_password it shouls be encrypted and export
const api_name = "User login"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        /********************************************************************************** 
    login deatils:
    1. "user_email":"john@gmail.com",
        "user_password":"john"
        2. "user_email":"anna@gmail.com",
        "user_password":"anna"
        3. "user_email":"raj@hotmail.com",
        "user_password":"raj"

*********************************************************************************************/
        const type = body.type
        console.log("type:", type)
        console.log("user_id:", body.user_id)
        console.log("user_password:", body.user_password)
        let user_id_exist = []
        if (type === "email") {
            user_exist = await db.search_two(
                "users",
                "user_email",
                "user_password",
                body.user_id,
                body.user_password
            )
        } else if (type === "phone") {
            user_exist = await db.search_two(
                "users",
                "user_phone_number",
                "user_password",
                body.user_id,
                body.user_password
            )
        }
        // const user_exist = await db.search_one(
        //   "users",
        //   "user_email",
        //   //"user_password",
        //   body.user_email
        //   //body.user_password
        // );

        if (user_exist.length == 0) {
            return handler.returner([false, { message: "Password is invalid" }], api_name, 400)
        }

        console.log("user_exist.length ", user_exist)

        const created_token = await auth_token.create(user_exist[0].id_user)
        console.log("created_token:", created_token)
        let data = {
            id_user: user_exist[0].id_user,
            token: created_token,
            ut_datetime_created: await handler.datetime(),
        }

        const result = await db.insert_new(data, "user_tokens")
        //console.log("user_access_level ", user_exist[0].id_user_access_level);
        console.log("user_dob ", user_exist[0].user_dob)
        //-------- get users access levels from tables with sub queries
        //     const user_access_level=select id_user_access_level from user_access_level_m2m_users
        // where id_id_user =(select id_user from users where user_email="anna@gmail.com");
        const id = await db.select_oneColumn(
            "users",
            "id_user",
            "user_email",
            user_exist[0].user_email
        )
        const currentuser_access_level = await db.select_oneColumn(
            "user_access_level_m2m_users",
            "id_user_access_level",
            "id_id_user",
            id
        )
        let access_level = null
        if (currentuser_access_level == 0) {
            access_level = [0, 1, 2, 3, 4, 5]
        } else if (currentuser_access_level == 1) {
            access_level = [1, 3, 4, 5]
        } else if (currentuser_access_level == 2) {
            access_level = [2, 3, 4, 5]
        }
        return handler.returner(
            [
                true,
                {
                    token: created_token,
                    //hard coded access_levels
                    user_access_level: access_level,
                    // user_exist[0].id_user % 3 == 0
                    //   ? [2, 3, 4, 5]
                    //   : user_exist[0].id_user % 2 == 0
                    //   ? [1, 3, 4, 5]
                    //   : [0, 1, 2, 3, 4, 5], //[2, 3, 4, 5], //user_exist[0].id_user_access_level,
                },
            ],
            api_name,
            201
        )
    } catch (e) {
        console.log("Error: ", e)
        return handler.returner([false, e], api_name)
    }
}
//tests
// {
//     "user_id":"22222",
//     "type":"phone",
//     "user_password":"anna"
// }
//test
// {
//     "user_id":"anna@gmail.com",
//     "type":"email",
//     "user_password":"anna"
// }
