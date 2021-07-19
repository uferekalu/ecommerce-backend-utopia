require("dotenv").config()
const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const secret = process.env.mySecret
const Cryptr = require("cryptr")
const cryptr = new Cryptr(`${secret}`)

const api_name = "User Email or Phone verify"

const error_one = "Email verification failed!"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        let is_email, is_phone, id_user

        if (param) {
            const { token } = param
            console.log(token)
            console.log("PARAM", param)
            id_user = cryptr.decrypt(token)
            is_email = (await db.select_all_with_condition("users", { id_user }))[0]
        }

        console.log("EMAIL", is_email)

        if (is_email) await db.update_with_condition("users", { email_verified: 1 }, { id_user })

        if (!is_email) throw error_one

        // if (is_phone) await db.update_with_condition("users", { phone_verified: 1 }, { id_user })

        return handler.returner([true, { message: "email verified successfully" }], api_name, 201)
    } catch (e) {
        console.log(e);
        if (e === error_one || e.message == 'Invalid IV length') {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
