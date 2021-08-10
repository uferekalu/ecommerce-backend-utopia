const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "product delete handler"
const custom_errors = ["authentication required","no product found"]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["token", "id_product_m2m_vendor"];

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new Error(missing_fields)
        }

        const { token, id_product_m2m_vendor } = body

        const id_user = await auth_token.verify(token)

        if(!id_user){
            throw new Error(custom_errors[0])
        }

        const product = await db.search_one(
            "products_m2m_vendors",
            "id_product_m2m_vendor",
            id_product_m2m_vendor
        )

        if (product.length === 0) {
            throw new custom_errors[1]
        }

        await db.update_one("products_m2m_vendors", {is_deleted: product[0].is_deleted === 0 ? 1 : 0},
         "id_product_m2m_vendor", id_product_m2m_vendor)

        return handler.returner([true, product], api_name, 200)
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        console.log(e)
        return handler.returner([false], api_name, 500)
    }
}
