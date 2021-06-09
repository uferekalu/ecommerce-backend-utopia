const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "User details"
const error_one = "user not found"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_user } = param

        const user = (await db.select_one("users", { id_user }))[0]

        if (!user) {
            throw `${error_one}`
        }

        delete user.user_password

        return handler.returner([true, user], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
