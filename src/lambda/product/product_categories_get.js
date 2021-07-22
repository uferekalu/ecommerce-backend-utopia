const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"

exports.handler = async (event, context) => {
    try {
        const categories = await db.select_many("product_categories", [
            "id_product_category",
            "category_name",
            "category_icon_url",
            "category_image_url",
        ])

        return handler.returner([true, categories], api_name, 200)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
