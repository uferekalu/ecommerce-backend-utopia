const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Vendor orders get"
const errors_array = ["body is empty", "authentication required", "no orders found"]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { token } = body

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${errors_array[1]}`
        }

        const { id_vendor } = (
            await db.select_one_with_condition("users", "id_vendor", { id_user })
        )[0]

        const data = await db.select_all_from_join4_with_condition_and_orderB(
            "orders_m2m_products",
            "orders",
            "products_m2m_vendors",
            "products",
            "id_order",
            "id_product_m2m_vendor",
            "id_product",
            { id_vendor },
            "order_created_at",
            "DESC"
        )

        if (data.length < 1) {
            throw `${errors_array[2]}`
        }

        // const orders = []
        // const code = []
        // const products = []

        // data.map((item) => {
        //     if (!orders.includes(item.id_order)) {
        //         orders.push(item.id_order)
        //         item.quantity = 1
        //         code.push(item.id_product_m2m_vendor)
        //         products.push(item)
        //     } else {
        //         const index = code.indexOf(item.id_product_m2m_vendor)
        //         products[index].quantity++
        //     }
        // })

        return handler.returner([true, data], api_name, 200)
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
