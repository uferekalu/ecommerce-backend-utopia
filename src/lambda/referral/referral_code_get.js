const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Referral code create"
const errors_array = ["body is empty", "Authentication required", "No referral code found"]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { token } = body

        const isAuthUser = await auth_token.verify(token)

        if (!isAuthUser) {
            throw `${errors_array[1]}`
        }

        const response = (await db.select_one("referral_codes", { id_user: isAuthUser }))[0]

        if (!response) {
            throw `${errors_array[2]}`
        }

        const { referral_code } = response

        return handler.returner([true, referral_code], api_name)
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
