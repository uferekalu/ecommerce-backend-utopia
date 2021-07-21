const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Referral code create"
const custom_errors = ["body is empty", "Authentication required", "No referral code found"]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { token } = body

        const isAuthUser = await auth_token.verify(token)

        if (!isAuthUser) {
            throw `${custom_errors[1]}`
        }

        const response = (await db.select_one("referral_codes", { id_user: isAuthUser }))[0]

        if (!response) {
            throw `${custom_errors[2]}`
        }

        const { referral_code } = response

        return handler.returner([true, referral_code], api_name)
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
