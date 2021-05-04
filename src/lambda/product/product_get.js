const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "product get"

exports.handler = async (event, context) => {
    try {
        const query = event.pathParameters

        const product = await db.search_one("products", "id_product", query.id_product)

        if (product.length < 1) {
            throw "invalid product id"
        }
        const { id_category, product_title, id_product_thumbnail } = product[0]

        const cat_search = await db.search_one(
            "product_categories",
            "id_product_category",
            id_category
        )

        const thum_search = await db.search_one(
            "product_thumbnails",
            "id_product_thumbnail",
            id_product_thumbnail
        )

        const category = cat_search[0]?.category_name
        let thumbnail = null

        if (thum_search.length > 0) {
            thumbnail = { title: thum_search[0].title, url: thum_search[0].url }
        }

        const data = { category, product_title, thumbnail }

        return handler.returner([true, data], api_name, 200)
    } catch (e) {
        return handler.returner([false, e], api_name, 404)
    }
}
