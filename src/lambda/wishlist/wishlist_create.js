const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Wishlist create"
const custom_errors = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "wishlist create unsuccessful",
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

        const required_fields = ["token", "id_user", "wishlist"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { wishlist, id_user, token } = body

        const user_exist = (await db.search_one("users", "id_user", id_user))[0]

        if (!user_exist) {
            throw `${custom_errors[1]}`
        }

        const isAuthUser = await auth_token.verify(token)

        if (id_user != isAuthUser) {
            throw `${custom_errors[2]}`
        }

        const wishlist_string = JSON.stringify(wishlist)

        const wish_list_exist = (
            await db.select_one("wishlists", {
                id_user,
            })
        )?.length

        const wishlist_datetime = await handler.datetime()

        const data = {
            id_user,
            wishlist_items: wishlist_string,
        }

        let new_wishlist

        if (wish_list_exist === 0) {
            data.wishlist_datetime_created = wishlist_datetime
            data.wishlist_datetime_updated = wishlist_datetime
            new_wishlist = await db.insert_new(data, "wishlists")
        }

        if (wish_list_exist > 0) {
            data.wishlist_datetime_updated = wishlist_datetime
            new_wishlist = await db.update_with_condition("wishlists", data, { id_user })
        }

        if (!new_wishlist) {
            throw `${custom_errors[3]}`
        }

        data.wishlist_items = wishlist

        return handler.returner([true, data], api_name, 201)
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
