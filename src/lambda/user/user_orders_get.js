const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "User orders"
const error_one = "no orders found"
exports.handler = async (event, context) => {
    try {
        const limit = 20
        const param = event.pathParameters

        const { id_user } = param

        const all_orders = await db.select_many_with_condition(
            "orders",
            ["id_order", "created_at"],
            { id_user }
        )

        if (all_orders.length < 1) {
            throw `${error_one}`
        }

        const mapped_products = all_orders.map(async (item) => {
            const { id_order, created_at } = item
            const result = await db.select_many_with_condition(
                "orders_m2m_products",
                ["id_order_m2m_product", "id_product_m2m_vendor"],
                {
                    id_order,
                }
            )

            const index = result.length

            for (let i = 0; i < index; i++) {
                result[i].created_at = created_at
            }

            return result
        })

        const resolved_products = await Promise.all(mapped_products)

        const flattened_products = resolved_products.flat()

        let items = []
        let count = []
        let onset = []
        let ordered = []

        flattened_products.map((order) => {
            const { id_product_m2m_vendor, id_order_m2m_product, created_at } = order

            if (!items.includes(id_product_m2m_vendor)) {
                items.push(id_product_m2m_vendor)
                ordered.push(id_order_m2m_product)
                count.push(1)
                onset.push(created_at)
            } else {
                const index = items.indexOf(id_product_m2m_vendor)
                count[index]++
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
            const quantity = count[pos]
            const id_order_m2m_product = ordered[pos]
            details[0].created_at = onset[pos]
            delete details[0].updated_at

            return [{ product_title, id_order_m2m_product, quantity, ...details[0] }]
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
