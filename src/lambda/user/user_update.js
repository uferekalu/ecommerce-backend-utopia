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

        // Update profile image
        if (others.url_info) {
            let id_user_profile_image

            if (!others.url_info.id_user_profile_image) {
                console.log(1);
                const result = await db.insert_new(others.url_info, "user_profile_images")
                id_user_profile_image = result.insertId
                await db.update_one("users", { id_user_profile_image }, "id_user", id_user)
            } else {
                console.log(others.url_info);
                console.log(2);
                await db.update_one(
                    "user_profile_images",
                    others.url_info,
                    "id_user_profile_image",
                    others.url_info.id_user_profile_image
                )
            }

            return handler.returner([true, others.url_info], api_name, 201)
        }

        // Update normal user info
        if (!others.url_info) {
            if (optional_fields.includes("url_info")) {
                delete others.url_info
            }
            const updated_data = { ...others }

            await db.update_one("users", updated_data, "id_user", id_user)
            return handler.returner([true, updated_data], api_name, 201)
        }
    } catch (e) {
        console.log(e)
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
