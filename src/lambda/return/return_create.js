const handler = require("../../middleware/handler")
const { insert_new, search_one } = require("../../lib/database/query")

const api_name = "Return create"

exports.handler = async (event, context) => {
    try {
        const datetime = handler.datetime()
        const body = JSON.parse(event.body)

        //handles error of empty request body
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        //handling error of missing required field
        const all_fields = Object.keys(body)
        //
        const required_fields = ["reason", "token"]
        //
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))
        //
        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { reason, token } = body

        //id_order_m2m_product is unique to every ordered product
        const { id_order_m2m_product } = event.pathParameters

        //check if product was ordered
        const ordered_product = await search_one(
            "orders_m2m_products",
            "id_order_m2m_product",
            id_order_m2m_product
        )

        //throw an error if not
        if (ordered_product.length == 0) {
            throw "order does not exist"
        }

        //id_order is an FK on orders_m2m_table
        const order_id = ordered_product[0].id_order

        //more confirmation on order. Although, orders_m2m_product cannot exist without an id_order
        //but we need it to ensure the customer actually made the order
        const order = await search_one("orders", "id_order", order_id)

        const user_id = order[0].id_user

        const isAuth = await db.search_one("user_tokens", "id_user", user_id)

        //a use case is if the user is no longer logged in on device1 due to logging in on device2
        //so requiring him to log in on device1 again to continue
        //other than that, the error should never be throw
        if (isAuth[0].token !== token) {
            throw "authentication required"
        }

        //*****************currently evaluating if some tables will be added
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
