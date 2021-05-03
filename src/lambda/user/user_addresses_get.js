const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

//-----required data user_id
//---------- check if incoming user id exists, if so get the address and send it as response
const api_name = "User addresses get"
exports.handler = async (event, context) => {
    try {
        const user_id = event.pathParameters.user_id
        const body = JSON.parse(event.body)

        const user_exist = await db.search_one("users", "id_user", user_id)

        if (user_exist.length == 0)
            return handler.returner([false, { message: `User does not exist` }], api_name, 404)

        const billingAddress = await db.select_oneColumn(
            "users",
            "user_address_billing",
            "id_user",
            user_id
        )
        const shippingAddress = await db.select_oneColumn(
            "users",
            "user_address_shipping",
            "id_user",
            user_id
        )

        // let wishlist_name_list = whish_list.map((item) => {
        //   return item.wishlist_name;
        // });

        return handler.returner(
            [
                true,
                {
                    billingAddress: billingAddress[0].user_address_billing,
                    shippingAddress: shippingAddress[0].user_address_shipping,
                },
            ],
            api_name,
            200
        )
    } catch (e) {
        console.log("Error: ", e)
        return handler.returner([false, e], api_name)
    }
}
