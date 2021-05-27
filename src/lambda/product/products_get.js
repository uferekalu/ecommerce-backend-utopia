const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Products get"
const error_one = "no product found"

exports.handler = async () => {
    try {
        const products = await db.select_all_from_join(
            "products_m2m_vendors",
            "products",
            "id_product"
        )

        if (products.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, products], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
