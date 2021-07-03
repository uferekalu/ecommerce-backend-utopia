const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "product get"
const error_one = "no product found"

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const {
            id_product,
            ...others
        } = body

        const product = await db.aaron_select_all_from_join_with_condition(
            "products",
            "products_m2m_vendors",
            "id_product",
            "products.id_product",
             id_product
        )

        if (product.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, product[0]], api_name, 200)
    } catch (e) {
        console.log("ggg: ",e)
        return handler.returner([false, e], api_name, 404)
    }
}
