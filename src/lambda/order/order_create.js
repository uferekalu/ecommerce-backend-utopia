const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const api_name = "Order create"

exports.handler = async (event, context) => {
    try {
        const datetime = await handler.datetime()

        const body = JSON.parse(event.body)

        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["id_user", "id_product_m2m_vendor", "paymentMethod"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { id_user, id_product_m2m_vendor, paymentMethod } = body

        // ensure user exists
        const user_exist = await db.search_one("users", "id_user", id_user)

        //if user does not exist return error
        if (user_exist.length === 0) {
            throw "user not found"
        }

        const mapped_prices = id_product_m2m_vendor.map(async (_id) => {
            const res = await db.search_one("products_m2m_vendors", "id_product_m2m_vendor", _id)
            return res[0].p2v_price
        })
        const prices = await Promise.all(mapped_prices)

        const total = prices.reduce((sum, price) => sum + price)

        const new_order = await db.insert_new(
            { total, id_user, order_created_at: datetime, paymentMethod },
            "orders"
        )

        if (!new_order) {
            throw " order not created successfully"
        }

        const id_order = new_order.insertId

        const values = id_product_m2m_vendor.map((_id) => [_id, id_order])

        const new_order_m2m_product = await db.insert_many(
            values,
            ["id_product_m2m_vendor", "id_order"],
            "orders_m2m_products"
        )

        if (!new_order_m2m_product) {
            throw "orders_m2m_products not created successfully"
        }

        const { affectedRows, insertId } = new_order_m2m_product
        let id_order_m2m_product = []
        for (let i = 0; i < affectedRows; i++) {
            id_order_m2m_product.push(i + insertId)
        }

        const data = {
            message: "order created successfully",
            id_order_m2m_product,
        }

        return handler.returner([true, data], api_name, 201)
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
