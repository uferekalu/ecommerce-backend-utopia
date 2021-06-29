const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "User orders"
const errors_array = ["body is empty", "authentication required", "no orders found"]
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { token } = body

        console.log("TOKEN", token)

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${errors_array[1]}`
        }

        const response = await db.select_all_from_join4_with_conditionB(
            "orders_m2m_products",
            "orders",
            "products_m2m_vendors",
            "products",
            "id_order",
            "id_product_m2m_vendor",
            "id_product",
            { id_user }
        )

        console.log("RESPONSE", response)

        const orders = []
        const code = []
        const products = []

        response.map((item) => {
            if (!orders.includes(item.id_order)) {
                orders.push(item.id_order)
                item.quantity = 1
                code.push(item.id_product_m2m_vendor)
                products.push(item)
            } else {
                const index = code.indexOf(item.id_product_m2m_vendor)
                products[index].quantity++
            }
        })

        console.log("ORDERS", orders)
        console.log("CODE", code)
        console.log("PRODUCTS", products)

        if (!products) {
            throw `${errors_array[2]}`
        }

        return handler.returner([true, response], api_name)
    } catch (e) {
        if (errors_array.includes(e)) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
