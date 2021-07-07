const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const Cryptr = require("cryptr")
const cryptr = new Cryptr("myTotalySecretKey")

const api_name = "User Email or Phone verify"

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        //get type of user_id has been sent(email or phone)
        const token = event.pathParameters
        const decrypt_token = cryptr.decrypt(token)

        // const { id_user, type } = decrypt_param

        // let is_email, is_phone
        // if (type === "email") {
        //     is_email = (await db.search_one("users", "user_email", id_user))[0]
        // } else if (type === "phone") {
        //     is_phone = (await db.search_one("users", "user_phone_number", id_user))[0]
        // }

        // if (!is_email && !is_phone) throw "User not found!"

        // if (is_email) await db.update_with_condition("users", { email_verified: 1 }, { id_user })

        // if (is_phone) await db.update_with_condition("users", { phone_verified: 1 }, { id_user })

        return handler.returner([true], api_name, 201)
    } catch (e) {
        return handler.returner([false, e], api_name)
    }
}
