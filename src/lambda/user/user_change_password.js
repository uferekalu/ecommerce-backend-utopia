const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")
const bcrypt = require("bcryptjs")

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

const api_name = "User change password"
const custom_errors = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "old password is invalid",
    "password reset failed, please try again",
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

        const required_fields = ["token", "user_old_password", "user_new_password"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { token, user_old_password, user_new_password } = body

        const isAuthUser = await auth_token.verify(token)

        console.log(isAuthUser)

        const user_exist = (await db.search_one("users", "id_user", isAuthUser))[0]

        if (!user_exist) {
            throw `${custom_errors[1]}`
        }

        if (!isAuthUser) {
            throw `${custom_errors[2]}`
        }

        const pass_valid = await bcrypt.compare(user_old_password, user_exist.user_password)

        if (!pass_valid) {
            throw `${custom_errors[3]}`
        }

        const password_hashed = await passwordHash(user_new_password)

        const isUpdated = await db.update_one(
            "users",
            { user_password: password_hashed },
            "id_user",
            isAuthUser
        )

        if (isUpdated.changedRows !== 1) {
            throw `${custom_errors[4]}`
        }

        return handler.returner([true, { message: "password reset successful" }], api_name, 201)
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
