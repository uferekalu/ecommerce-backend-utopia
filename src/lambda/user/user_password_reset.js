const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")
const bcrypt = require("bcryptjs")
const Cryptr = require("cryptr")
const cryptr = new Cryptr("myTotalySecretKey")

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

const api_name = "User password reset"
const errors_array = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "old password is invalid",
    "password reset failed, please try again",
]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        const param = event.pathParameters

        const { id_user } = param

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token", "user_old_password", "user_new_password"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { token, user_old_password, user_new_password } = body

        const user_exist = (await db.search_one("users", "id_user", id_user))[0]

        if (!user_exist) {
            throw `${errors_array[1]}`
        }

        const isAuthUser = await auth_token.verify(token)

        if (id_user != isAuthUser) {
            throw `${errors_array[2]}`
        }

        const pass_valid = await bcrypt.compare(user_old_password, user_exist.user_password)

        if (!pass_valid) {
            throw `${errors_array[3]}`
        }

        const password_hashed = await passwordHash(user_new_password)

        const isUpdated = await db.update_one(
            "users",
            { user_password: password_hashed },
            "id_user",
            id_user
        )

        if (isUpdated.changedRows !== 1) {
            throw `${errors_array[4]}`
        }

        return handler.returner([true, { message: "password reset successful" }], api_name, 201)
    } catch (e) {
        let errors
        if (e.name === "Error") {
            errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")
        }

        if (errors_array.includes(e)) {
            errors = e
        }

        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
