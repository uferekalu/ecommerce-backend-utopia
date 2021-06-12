const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product details get"
const error_one = "product not found"

exports.handler = async (event) => {
    try {
        const param = event.pathParameters
        const { id_product_m2m_vendor } = param

        const details = await db.select_all_from_join3_with_condition(
            "products",
            "products_m2m_vendors",
            "product_thumbnails",
            "id_product",
            "id_product_thumbnail",
            { id_product_m2m_vendor }
        )

        if (details.length === 0) {
            throw `${error_one}`
        }

        const product = details[0]

        return handler.returner([true, product], api_name)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
