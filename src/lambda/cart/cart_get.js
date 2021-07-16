const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Cart get"
const custom_errors = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "your cart is empty",
    "cart get unsuccessful",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token", "id_user"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { id_user, token } = body

        const user_exist = (await db.search_one("users", "id_user", id_user))[0]

        if (!user_exist) {
            throw `${custom_errors[1]}`
        }

        const isAuthUser = await auth_token.verify(token)

        if (id_user != isAuthUser) {
            throw `${custom_errors[2]}`
        }

        const cart = (await db.select_all_with_condition("carts", { id_user }))[0]

        if (!cart) {
            throw `${custom_errors[3]}`
        }

        const data = JSON.parse(cart.cart_items)

        return handler.returner([true, data], api_name, 200)
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
