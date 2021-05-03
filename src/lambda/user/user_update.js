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

        const required_fields = ["id_user", "token", "user_password"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }
        const { id_user, token, user_password, ...others } = body

        const user_exist = await db.search_one("users", "id_user", id_user)

        if (user_exist.length < 1) {
            throw "user does not exist"
        }

        const isAuth = await db.search_one("user_tokens", "id_user", id_user)

        if (isAuth.length < 1) {
            throw "authentication required"
        }

        const pass_valid = await bcrypt.compare(user_password, user_exist[0].user_password)

        if (!pass_valid) {
            throw "password is invalid"
        }

        const optional_fields = Object.keys(others)

        if (optional_fields.length < 1) {
            throw "nothing to update"
        }

        const updated_data = { ...others }

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
