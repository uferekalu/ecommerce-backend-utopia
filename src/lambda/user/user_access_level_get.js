const db = require("../../lib/database/query")
const handler = require("../../middleware/handler")

exports.handler = async (event, context) => {
    const api_name = "User Access Level Get"
    const table = "users"

    try {
        const body = JSON.parse(event.body)
        const all_user_data = await db.search_one(table, "user_email", body.user_email)
        const id_user_access_level = all_user_data[0].id_user_access_level

        return handler.returner([true, { id_access_level: id_user_access_level }], api_name)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
