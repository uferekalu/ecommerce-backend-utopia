const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "product get"
const error_one = "no product found"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_product } = param

        const product = await db.select_all_from_join_with_condition(
            "products",
            "product_thumbnails",
            "id_product_thumbnail",
            { id_product }
        )

        if (product.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, product], api_name, 200)
    } catch (e) {
        return handler.returner([false, e], api_name, 404)
    }
}
