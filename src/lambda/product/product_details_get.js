const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product details get"

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

        const product = details[0]

        return handler.returner([true, product], api_name)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
