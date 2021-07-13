require("dotenv").config()
const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const secret = process.env.mySecret
const Cryptr = require("cryptr")
const cryptr = new Cryptr(`${secret}`)

const api_name = "User Email or Phone verify"

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        const param = event.pathParameters

        let is_email, is_phone, id_user

        if (param) {
            const { token } = param
            id_user = cryptr.decrypt(token)
            is_email = (await db.select_all_with_condition("users", { id_user }))[0]
        }

        // if (!is_email && !is_phone) throw "User not found!"

        if (is_email) await db.update_with_condition("users", { email_verified: 1 }, { id_user })

        // if (is_phone) await db.update_with_condition("users", { phone_verified: 1 }, { id_user })

        return handler.returner([true, { message: "email verified successfully" }], api_name, 201)
    } catch (e) {
        return handler.returner([false, e], api_name)
    }
}
