const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const { delete_one } = require("../../lib/database/query")
//
const api_name = "User logout"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (body?.token) {
            console.log(body.token)
            const token_exist = (
                await db.select_all_with_condition("user_tokens", {
                    token: body.token,
                })
            )[0]

            if (token_exist) {
                await db.delete_with_condition("user_tokens", {
                    token: body.token,
                })
            }
        }

        return handler.returner([true, { message: "user logged out successfully" }], api_name, 201)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
