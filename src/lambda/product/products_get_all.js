const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product get all"
const error_one = "no product found"

exports.handler = async () => {
    try {
        const data = await db.select_all_from_join3(
            "products",
            "products_m2m_vendors",
            "product_thumbnails",
            "id_product",
            "id_product_thumbnail"
        )

        if (data.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, data], api_name)
        //
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
