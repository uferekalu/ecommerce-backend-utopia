const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const send = require("../../lib/services/email/send_email")

const secret = process.env.mySecret
const Cryptr = require("cryptr")
const cryptr = new Cryptr(`${secret}`)

const api_name = "Resend verification"
const custom_errors = [
    "body is empty",
    "Email already exist",
    "Phone number is taken",
    "Invalid referral code",
    "User create unsuccessful",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "customError"
    }
}

const email_info = {
    subject: "Email Verification",
    message: "Please click here to verify your email\n\n\n\n",
} // we can send  HTML template insted of messgae

exports.handler = async (event, context) => {
    try {
        const required_fields = ["user_email"]

        const body = JSON.parse(event.body)
        const all_fields = Object.keys(body)

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { user_email } = body

        const email_exist = await db.search_one("users", "user_email", user_email)
        if (email_exist.length === 0) {
            throw `${custom_errors[1]}`
        }

        const verification_token = cryptr.encrypt(`${email_exist[0].id_user}`)

        email_info.message += `${process.env.EMAIL_LINK}user-verification/email/${verification_token}`
        await send.email_result(user_email, email_info)

        return handler.returner([true, { message: "Verification sent!" }], api_name, 201)
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
