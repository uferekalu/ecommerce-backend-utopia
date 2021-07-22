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
    "Email already verified",
    "Verification code not sent, please enter your email again",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "customError"
    }
}

const email_info = {
    user_email: "",
    user_first_name: "",
    subject: "Email Verification",
    message: "Here is your verification code ",
}

exports.handler = async (event, context) => {
    try {
        let datetime = await handler.datetime()

        const required_fields = ["user_email"]

        const body = JSON.parse(event.body)
        const all_fields = Object.keys(body)

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { user_email } = body

        const email_exist = (await db.search_one("users", "user_email", user_email))[0]
        if (!email_exist) {
            throw `${custom_errors[1]}`
        }

        if (email_exist.email_verified === 1) {
            throw `${custom_errors[2]}`
        }

        const verification_code = Math.random().toString(36).substr(2, 8)

        await db.update_with_condition(
            "verification_codes",
            {
                verification_code,
                datetime_updated: datetime,
            },
            { id_user: email_exist.id_user }
        )

        email_info.user_first_name = email_exist.user_first_name
        email_info.user_email = user_email
        email_info.message += `<b>${verification_code}</b>`

        const email_sent = await send.email(email_info)

        if (!email_sent) throw `${custom_errors[3]}`

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
