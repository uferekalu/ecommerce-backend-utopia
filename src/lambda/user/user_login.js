const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const token = require("../../middleware/verify_token")
const bcrypt = require("bcryptjs")
const qs = require("querystring")

const api_name = "User login"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        //throw an error if neither user_email nor user_phone_number is provided
        if (!all_fields.includes("user_email") && !all_fields.includes("user_phone_number")) {
            throw "please provide an email or a phone number"
        }
        //throw an error if password is not provided
        if (!all_fields.includes("user_password")) {
            throw "please provide your password"
        }

        let user_exist

        //if email was chosen as preferred login detail
        if (all_fields.includes("user_email")) {
            user_exist = await db.search_one("users", "user_email", body.user_email)
        }

        //if phone number was chosen as preferred login detail
        if (all_fields.includes("user_phone_number")) {
            user_exist = await db.search_one("users", "user_phone_number", body.user_phone_number)
        }

        if (user_exist.length === 0) {
            throw "invalid login"
        }

        //comparing the provided password with the hashed version using the library reverse check
        const pass_valid = await bcrypt.compare(body.user_password, user_exist[0].user_password)

        if (!pass_valid) {
            throw "invalid login"
        }

        //the essence of having generic error message is for security purpose,
        //you dont want to hint a potential hacker what they are getting wrong or right.

        const id_user = user_exist[0].id_user
        const user_first_name = user_exist[0].user_first_name
        //console.log("id_user:", id_user)
        //newly created token
        const created_token = await token.create_token(user_exist[0].id_user)

        let data = {
            id_user,
            token: created_token,
            ut_datetime_created: await handler.datetime(),
        }

        //checking if the user already have a session token stored
        const check_token = await db.search_one("user_tokens", "id_user", id_user)

        //if user was not already logged in, signified by absence of a token,
        //then the newly created token will be added to the user_tokens table
        //if user was already logged in, signified by presence of a token,
        //then the newly created token will replace the old one
        //potentially logging the user out if he was previously logged in on another device
        if (check_token.length > 0) {
            await db.update_one("user_tokens", data, "id_user", id_user)
        } else {
            await db.insert_new(data, "user_tokens")
        }

        /*
    if (user_exist[0].email_verified != 1)
      return handler.returner(
        [false, { message: "Account is not verified" }],
        api_name,
        400
      );*/

        const id = await db.select_oneColumn(
            "users",
            "id_user",
            "user_email",
            user_exist[0].user_email
        )
        const user_access_level = await db.select_oneColumn(
            "user_access_level_m2m_users",
            "id_user_access_level",
            "id_id_user",
            id[0].id_user
        )
        // console.log("id:", id[0].id_user)
        // const currentuser_access_level = await db.search_one(
        //     "user_access_level_m2m_users",
        //     "id_id_user",
        //     id[0].id_user
        // )
        console.log("currentuser_access_level[0]:", user_access_level[0].id_user_access_level)
        //console.log("currentuser_access_level:", currentuser_access_level)
        const currentuser_access_level = user_access_level[0].id_user_access_level
        let access_level = [4, 5]
        if (currentuser_access_level == 0) {
            access_level.push(2, 3) // [0, 1, 2, 3, 4, 5]
        } else if (currentuser_access_level == 1) {
            access_level.push(1, 2, 3) //[1, 3, 4, 5]
        } else if (currentuser_access_level == 2) {
            access_level.push(0, 1, 2, 3)
        }
        return handler.returner(
            [
                true,
                {
                    token: created_token,
                    //hard coded access_levels
                    user_access_level: access_level,
                    id_user,
                    user_first_name,
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
