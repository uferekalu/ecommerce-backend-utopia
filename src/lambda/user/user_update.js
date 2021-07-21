const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "User update"
const custom_errors = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "nothing to update",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }
        const { token, ...others } = body

        const id_user = await auth_token.verify(token)

        const user_exist = (await db.select_all_with_condition("users", { id_user }))[0]

        if (!user_exist) {
            throw `${custom_errors[1]}`
        }

        if (!id_user) {
            throw `${custom_errors[2]}`
        }

        const optional_fields = Object.keys(others)

        if (optional_fields.length < 1) {
            throw `${custom_errors[3]}`
        }

        if (optional_fields.includes("user_password")) {
            delete others.user_password
        }

        // Update profile image
        if (others.url_info) {
            let id_user_profile_image

            if (!others.url_info.id_user_profile_image) {
                const result = await db.insert_new(others.url_info, "user_profile_images")
                id_user_profile_image = result.insertId
                await db.update_one("users", { id_user_profile_image }, "id_user", id_user)
            } else {
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

            await db.update_with_condition("users", updated_data, { id_user })

            return handler.returner([true, updated_data], api_name, 201)
        }
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
