const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")
const api_name = "Product review create"

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["id_product_m2m_vendor", "product_review", "id_user", "token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { id_user, id_product_m2m_vendor, product_review, token } = body
        // retrieve the token(s) from the user_tokens table.
        // could return an array of more than one token
        const isAuth = await db.search_one("user_tokens", "id_user", id_user)

        if (isAuth[0].token !== token) {
            throw "authencation required"
        }

        // ensure product exist
        const product_m2m_vendor_exist = await db.search_one(
            "products_m2m_vendors",
            "id_product_m2m_vendor",
            id_product_m2m_vendor
        )
        //if product does not exist return error
        if (product_m2m_vendor_exist.length === 0) {
            throw "product does not exist"
        }
        // extract order_m2m_product record using the condition id_product_m2m_vendor
        const order_m2m_product = await db.search_one(
            "orders_m2m_products",
            "id_product_m2m_vendor",
            id_product_m2m_vendor
        )
        //if product order record doesnt exist return error
        if (order_m2m_product.length === 0) {
            throw "order does not exist"
        }
        // retrieve the id_order_m2m_product
        const { id_order_m2m_product } = order_m2m_product[0]

        const data = { product_review, id_order_m2m_product, pr_datetime_created: datetime }
        const result = await db.insert_new(data, "product_reviews")
        if (result) {
            return handler.returner([true, data], api_name, 201)
        }
    } catch (e) {
        if (e.name === "Error") {
            const errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")

            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 400)
    }
}
