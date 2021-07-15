const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "product get"
const custom_errors = ["body is empty", "authentication required", "no product found"]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["token", "id_product"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { token, id_product } = body

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${custom_errors[1]}`
        }

        const { id_vendor } = (await db.select_all_with_condition("users", { id_user }))[0]

        if (!id_vendor) {
            throw `${custom_errors[1]}`
        }

        const product = await db.select_one_from_join3_with_2conditions(
            "products",
            "products_m2m_vendors",
            "product_thumbnails",
            "id_product",
            "id_product_thumbnail",
            `${id_product}`
        )

        if (product.length === 0) {
            throw `${custom_errors[2]}`
        }

        return handler.returner([true, product[0]], api_name, 200)
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
