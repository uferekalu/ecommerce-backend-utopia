const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "cart create"
const errors_array = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "cart create unsuccessful",
]

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token", "id_user", "cart"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { cart, id_user, token } = body

        const user_exist = (await db.search_one("users", "id_user", id_user))[0]

        if (!user_exist) {
            throw `${errors_array[1]}`
        }

        const isAuthUser = await auth_token.verify(token)

        if (id_user != isAuthUser) {
            throw `${errors_array[2]}`
        }

        const cart_string = JSON.stringify(cart)

        const cart_exist = (await db.select_one("carts", {
            id_user
        }))?.length

        const cart_datetime = await handler.datetime()

        const data = {
            id_user,
            cart_items: cart_string,
        }

        let new_cart

        console.log(cart_exist)

        if (!cart_exist) {
            data.cart_datetime_created = cart_datetime
            new_cart = await db.insert_new(data, "carts")
        }

        if (cart_exist) {
            data.cart_datetime_updated = cart_datetime
            new_cart = await db.update_with_condition("carts", data, { id_user })
        }

        if (!new_cart) {
            throw `${errors_array[3]}`
        }

        data.cart_items = cart

        return handler.returner([true, data], api_name, 201)
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
        return handler.returner([false, e], api_name, 500)
    }
}
