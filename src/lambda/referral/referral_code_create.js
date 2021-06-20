const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Referral code create"
const errors_array = [
    "body is empty",
    "Authentication required",
    "Code is taken, please try another",
]

exports.handler = async (event, context) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["referral_code", "token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { referral_code, token } = body

        const isAuthUser = await auth_token.verify(token)

        if (!isAuthUser) {
            throw `${errors_array[1]}`
        }

        const code_exist = (await db.select_one("referral_codes", { referral_code }))[0]

        if (code_exist) {
            throw `${errors_array[2]}`
        }
        const isReferee = (await db.select_one("referral_codes", { id_user: isAuthUser }))[0]

        if (isReferee) {
            const update = {
                referral_code,
                code_updated_at: datetime,
            }
            const yes = await db.update_with_condition("referral_codes", update, {
                id_user: isAuthUser,
            })
        }

        if (!isReferee) {
            const data = {
                id_user: isAuthUser,
                referral_code,
                code_created_at: datetime,
            }

            await db.insert_new(data, "referral_codes")
        }

        return handler.returner(
            [true, { message: "Code created successfully", referral_code }],
            api_name,
            201
        )
    } catch (e) {
        let errors
        if (e.name === "Error") {
            errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")
        }

        if (errors_array.includes(e)) {
            errors = e
        }

        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
