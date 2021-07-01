const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const { delete_one } = require("../../lib/database/query")
//
const api_name = "User logout"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (body?.token) {
            const token_exist = await db.search_one("user_tokens", "token", body.token)

            if (token_exist.length > 0) {
                await delete_one("user_tokens", "token", body.token)
            }
        }

        return handler.returner([true], api_name, 201)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
