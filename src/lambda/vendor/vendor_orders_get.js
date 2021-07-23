const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Vendor orders get"
const custom_errors = ["body is empty", "authentication required", "no orders found"]
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

        const required_fields = ["token"]

        console.log(body);

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { token } = body

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${custom_errors[1]}`
        }

        const { id_vendor } = (
            await db.select_one_with_condition("users", "id_vendor", { id_user })
        )[0]

        const data = await db.select_all_from_join5_with_conditionB_and_order(
            "orders_m2m_products",
            "orders",
            "products_m2m_vendors",
            "products",
            "users",
            "id_order",
            "id_product_m2m_vendor",
            "id_product",
            "id_user",
            { "products_m2m_vendors.id_vendor": id_vendor },
            "order_created_at",
            "DESC"
        )

        return handler.returner([true, data], api_name, 200)
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
