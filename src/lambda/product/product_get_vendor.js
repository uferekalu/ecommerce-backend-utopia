const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "product get"
const errors_array = ["body is empty", "authentication required", "no product found"]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["token", "id_product"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { token, id_product } = body

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${errors_array[1]}`
        }

        const { id_vendor } = (await db.select_all_with_condition("users", { id_user }))[0]

        if (!id_vendor) {
            throw `${errors_array[1]}`
        }

        const product = await db.aaron_select_all_from_join_with_condition(
            "products",
            "products_m2m_vendors",
            "product_thumbnails",
            "id_product",
            "products.id_product",
            "id_thumbnail",
            { id_product },
            { id_vendor }
        )

        if (product.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, product[0]], api_name, 200)
    } catch (e) {
        console.log("ggg: ", e)
        return handler.returner([false, e], api_name, 404)
    }
}
