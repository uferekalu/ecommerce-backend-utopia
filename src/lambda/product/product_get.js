const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "product get"
const custom_errors = ["no product found"]

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
            throw `${custom_errors[0]}`
        }

        return handler.returner([true, product], api_name, 200)
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
