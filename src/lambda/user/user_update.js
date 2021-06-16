const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")

const api_name = "User update"

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        const required_fields = ["id_user", "token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }
        const { id_user, token, ...others } = body

        const user_exist = await db.search_one("users", "id_user", id_user)

        if (user_exist.length < 1) {
            throw "user does not exist"
        }

        const isAuth = await db.search_one("user_tokens", "id_user", id_user)

        if (isAuth.length < 1) {
            throw "authentication required"
        }

        const optional_fields = Object.keys(others)

        if (optional_fields.length < 1) {
            throw "nothing to update"
        }

        if (optional_fields.includes("user_password")) {
            delete others.user_password
        }

        const updated_data = { ...others }

        await db.update_one("users", updated_data, "id_user", id_user)

        return handler.returner([true, updated_data], api_name, 201)
    } catch (e) {
        if (e.name === "Error") {
            const errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")

            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 400)
    }
}
