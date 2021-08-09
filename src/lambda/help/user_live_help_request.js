const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const send = require("../../lib/services/email/send_email")

const api_name = "Live Help Request"
const custom_errors = [
    "body is empty",
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

        email_info.user_first_name = email_exist.user_first_name
        email_info.user_email = user_email
        email_info.message += `<b>${verification_code}</b>`

        const email_sent = await send.liveHelpMail(email_info)

        if (!email_sent) throw `${custom_errors[3]}`

        return handler.returner([true, { message: "Request Send you'll be contacted as soon as possible" }], api_name, 201)
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
