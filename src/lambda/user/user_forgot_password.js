const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")
const send = require("../../lib/services/email/send_email")

const api_name = "Forgot Password"
const custom_errors = ["body is empty", "email not found", "phone number not found"]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

const email_info = {
    subject: "Forgot Password",
    message: "Your new password is ",
} // we can send  HTML template insted of messgae

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["type"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        //get type = email || phone
        const { type, ...others } = body

        let id_user, medium

        if (type === "email") {
            const { user_email } = others
            medium = user_email
            const user = (await db.search_one("users", "user_email", user_email))[0]
            id_user = user.id_user
        }

        if (!id_user && type === "email") {
            throw `${custom_errors[1]}`
        }

        // if (type === "phone") {
        //     const { user_phone_number } = others
        //     medium = user_phone_number
        //     const user = (await db.search_one("users", "user_phone_number", user_phone_number))[0]
        //     id_user = user.id_user
        // }

        // if (!id_user && type === "phone") {
        //     throw `${custom_errors[2]}`
        // }

        // create new pasword
        let randomString = Math.random().toString(36).substr(2, 8)
        const new_password_hashed = await passwordHash(randomString)

        //update user
        await db.update_with_condition("users", { user_password: new_password_hashed }, { id_user })

        let response = {}

        if (type === "email") {
            //Send email
            email_info.message += randomString
            // await send.email(medium, email_info)
        }

        // if (type === "phone") {
        //     //Send sms
        //     // ....
        //     // ....
        // }

        response[type] = medium
        response.message = `New password has been sent to your ${type}`

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
