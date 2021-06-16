const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Wishlist create"
const errors_array = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "you have no wishlist",
    "wishlist create unsuccessful",
]

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token", "id_user", "wishlist"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { wishlist, id_user, token } = body

        const user_exist = (await db.search_one("users", "id_user", id_user))[0]

        if (!user_exist) {
            throw `${errors_array[1]}`
        }

        const isAuthUser = await auth_token.verify(token)

        if (id_user != isAuthUser) {
            throw `${errors_array[2]}`
        }

        if (wishlist.length < 1) {
            throw `${errors_array[3]}`
        }

        const wishlist_string = JSON.stringify(wishlist)

        const wish_list_exist = await db.select_one("wishlists", {
            wishlist_items: wishlist_string,
        })

        const wishlist_datetime = await handler.datetime()

        const data = {
            id_user,
            wishlist_items: wishlist_string,
        }

        let new_wishlist

        if (!wish_list_exist) {
            data.wishlist_datetime_created = wishlist_datetime
            new_wishlist = await db.insert_new(data, "wishlists")
        }

        if (wish_list_exist) {
            data.wishlist_datetime_updated = wishlist_datetime
            new_wishlist = await db.update_with_condition("wishlists", data, { id_user })
        }

        if (!new_wishlist) {
            throw `${errors_array[4]}`
        }

        data.wishlist_items = wishlist

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