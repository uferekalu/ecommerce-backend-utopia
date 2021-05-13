const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "User orders"
const error_one = "no orders found"
exports.handler = async (event, context) => {
    try {
        const limit = 20
        const param = event.pathParameters

        const { id_user, index } = param

        const all_orders = await db.select_many_with_condition_and_limit(
            "orders",
            ["id_order", "created_at"],
            { id_user },
            index,
            limit
        )

        if (all_orders.length < 1) {
            throw `${error_one}`
        }

        const mapped_products = all_orders.map(async (item) => {
            const { id_order, created_at } = item
            const result = await db.select_one_with_condition(
                "orders_m2m_products",
                "id_product_m2m_vendor",
                {
                    id_order,
                }
            )
            result[0].created_at = created_at
            return result
        })

        const resolved_products = await Promise.all(mapped_products)

        const flattened_products = resolved_products.flat()

        let items = []
        let quantity = []
        let onset = []

        flattened_products.map((order) => {
            const { id_product_m2m_vendor, created_at } = order

            if (!items.includes(id_product_m2m_vendor)) {
                items.push(id_product_m2m_vendor)
                quantity.push(1)
                onset.push(created_at)
            } else {
                const index = items.indexOf(id_product_m2m_vendor)
                quantity[index]++
            }
        })

        const products = items.map(async (_id, pos) => {
            const details = await db.search_one(
                "products_m2m_vendors",
                "id_product_m2m_vendor",
                _id
            )

            const { id_product } = details[0]
            const name = await db.select_one_with_condition("products", "product_title", {
                id_product,
            })

            const { product_title } = name[0]

            details[0].quantity = quantity[pos]
            details[0].created_at = onset[pos]
            details[0].product_title = product_title
            return details
        })

        const product_details = await Promise.all(products)
        const orders = product_details.flat()
        const data = {
            id_user,
            orders,
        }

        return handler.returner([true, data], api_name)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
