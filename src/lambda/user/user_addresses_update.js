const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

//-----required data user_address_billing, user_address_shipping, user_id
//---------- check if incoming user id exists, if so get the address and send it as response
const api_name = "User addresses update"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        const required_fields = [
            "id_user",
            "token",
            "user_address_billing",
            "user_address_shipping",
        ]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { id_user, token, user_address_billing, user_address_shipping } = body

        const user_exist = await db.search_one("users", "id_user", id_user)

        if (user_exist.length == 0)
            return handler.returner(
                [
                    false,
                    {
                        message: "user does not exist",
                    },
                ],
                api_name,
                404
            )

        const isAuth = await db.search_one("user_tokens", "id_user", id_user)

        if (isAuth.length == 0) {
            return handler.returner(
                [
                    false,
                    {
                        message: "authentication required",
                    },
                ],
                api_name,
                400
            )
        }

        const updateData = {
            user_address_shipping,
            user_address_billing,
        }
        const didAddressesUpdate = await db.update_one("users", updateData, "id_user", id_user)

        // let wishlist_name_list = whish_list.map((item) => {
        //   return item.wishlist_name;
        // });
        if (didAddressesUpdate.affectedRows == 0) {
            return handler.returner([
                false,
                { message: "Something went wrong, couldn't update user addresses" },
            ])
        }
        return handler.returner(
            [
                true,
                {
                    message: "Billing address and Shipping address have been updated",
                },
            ],
            api_name,
            201
        )
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
