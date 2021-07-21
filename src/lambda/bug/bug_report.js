const handler = require("../../middleware/handler")
const send = require("../../lib/services/email/send_email")

const api_name = "bug report"
const custom_errors = ["Email or message is empty"]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        const { user_email, content } = body

        if (!user_email || !content) throw `${custom_errors[0]}`

        const email_info = {
            subject: `Bug report sent by ${user_email}`,
            message: content,
        }

        await send.email("bugs@utopiatech.io", email_info)
        const response = {
            message: "Thank you for reporting a bug!",
        }
        return handler.returner([true, response], api_name, 201)
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
