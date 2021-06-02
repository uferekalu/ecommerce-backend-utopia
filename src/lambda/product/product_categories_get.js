const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"
const error_one = "No category found"

exports.handler = async (event, context) => {
    try {
        const categories = await db.select_many("product_categories", [
            "id_product_category",
            "category_name",
        ])
        if (categories.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, categories], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
