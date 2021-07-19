require("dotenv").config()
const handler = require("../middleware/handler")
const auth_token = require("../middleware/token_handler")
const db = require("../lib/database/query")
const send = require("../lib/services/email/send_email")
const bcrypt = require("bcryptjs")


const api_name = "Email send live test"

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "customError"
    }
}


exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        const a = await send.email(body.user_email, "email_info")
        await console.log("end called", await a)
        return handler.returner([true, a], api_name, 201)
    } catch (e) {
        console.log("error", e)
        return handler.returner([false], api_name, 500)
    }
}
