const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Referral code create"
const custom_errors = [
    "body is empty",
    "authentication required",
    "this is a premium code. please contact customercare@utopiatech.io for enquiries",
    "this is your current code",
    "code is taken, please try another",
]

const premium_codes = ["GOD", "BEST", "GOAT", "MESSI", "RONALDO", "QUEEN"]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["referral_code", "token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { referral_code, token } = body

        const isAuthUser = await auth_token.verify(token)

        if (!isAuthUser) {
            throw `${custom_errors[1]}`
        }

        if (premium_codes.includes(referral_code.toUpperCase())) {
            throw `${custom_errors[2]}`
        }

        const code_exist = (await db.select_one("referral_codes", { referral_code }))[0]

        if ((code_exist.id_user = isAuthUser)) {
            throw `${custom_errors[3]}`
        }

        if (code_exist) {
            throw `${custom_errors[4]}`
        }
        const isAffiliate = (await db.select_one("referral_codes", { id_user: isAuthUser }))[0]

        if (isAffiliate) {
            const update = {
                referral_code,
                code_updated_at: datetime,
            }

            await db.update_with_condition("referral_codes", update, {
                id_user: isAuthUser,
            })
        }

        if (!isAffiliate) {
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
