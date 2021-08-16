const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")
const bcrypt = require("bcryptjs")
const qs = require("querystring")

const api_name = "User login"
const custom_errors = [
    "body is empty",
    "please provide and email",
    "please provide your password",
    "Invalid login",
    "verify email",
    "User create unsuccessful",
]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        if (!all_fields.includes("user_email")) {
            throw `${custom_errors[1]}`
        }

        //throw an error if neither user_email nor user_phone_number is provided
        // if (!all_fields.includes("user_email") && !all_fields.includes("user_phone_number")) {
        //     throw "please provide an email or a phone number"
        // }

        //throw an error if password is not provided
        if (!all_fields.includes("user_password")) {
            throw `${custom_errors[2]}`
        }

        let user_exist
        const user_email = body.user_email

        //if email was chosen as preferred login detail
        if (all_fields.includes("user_email")) {
            user_exist = (await db.search_one("users", "user_email", user_email))[0]
        }

        //if phone number was chosen as preferred login detail
        // if (all_fields.includes("user_phone_number")) {
        //     user_exist = (await db.search_one("users", "user_phone_number", body.user_phone_number))[0]
        // }

        if (!user_exist) {
            throw `${custom_errors[3]}`
        }

        if (user_exist.email_verified === 0) {
            throw `${custom_errors[4]}`
        }
        //comparing the provided password with the hashed version using the library reverse check
        const pass_valid = await bcrypt.compare(body.user_password, user_exist.user_password)

        if (!pass_valid) {
            throw `${custom_errors[3]}`
        }

        //the essence of having generic error message is for security purpose,
        //you dont want to hint a potential hacker what they are getting wrong or right.

        const id_user = user_exist.id_user
        const user_first_name = user_exist.user_first_name
        const user_last_name = user_exist.user_last_name
        const user_phone_number = user_exist.user_phone_number
        const city = user_exist.city
        const country = user_exist.country

        //newly created token
        const created_token = await auth_token.create(user_exist.id_user)

        let data = {
            id_user,
            token: created_token,
            ut_datetime_created: await handler.datetime(),
        }

        const all_tokens = await db.select_one_with_condition_and_order(
            "user_tokens",
            "token",
            { id_user },
            "ut_datetime_created",
            "ASC"
        )

        if (all_tokens.length > 3) {
            const oldest_token = all_tokens[0].token
            await db.delete_with_condition("user_tokens", {
                token: oldest_token,
            })
        }

        await db.insert_new(data, "user_tokens")

        const user_details = (
            await db.select_all_from_join_with_condition("users", "vendors", "id_vendor", {
                user_email: user_exist.user_email,
            })
        )[0]

        let vendor_details = {}
        if (user_details?.id_vendor && user_details?.business_name) {
            const { business_name, id_vendor } = user_details
            vendor_details = { business_name, id_vendor }
        }

        const user_access_level = await db.select_oneColumn(
            "user_access_level_m2m_users",
            "id_user_access_level",
            "id_id_user",
            id_user
        )

        const current_user_access_level = user_access_level[0].id_user_access_level
        let access_level = [4, 5]
        if (current_user_access_level == 1) {
            access_level.push(2, 3) // [2, 3, 4, 5]
        } else if (current_user_access_level == 2) {
            access_level.push(1, 2, 3) //[1, 2, 3, 4, 5]
        } else if (current_user_access_level == 3) {
            access_level.push(0, 1, 2, 3) //[0, 1, 2, 3, 4, 5]
        }

        return handler.returner(
            [
                true,
                {
                    id_user,
                    user_first_name,
                    user_last_name,
                    user_phone_number,
                    user_email,
                    city,
                    country,
                    ...vendor_details,
                    user_access_level: access_level,
                    token: created_token,
                },
            ],
            api_name,
            201
        )
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 200)
        }
        return handler.returner([false], api_name, 500)
    }
}
