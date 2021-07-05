const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "User orders"
const custom_errors = ["body is empty", "authentication required"]
class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "customError"
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
        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { token } = body

        console.log("TOKEN", token)

        const id_user = await auth_token.verify(token)
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",id_user)

        if (!id_user) {
            throw `${custom_errors[1]}`
        }
        console.log("bbbbbbbbbbbbbbbb",id_user)
        const response = await db.select_all_from_join5_with_conditionB_and_order(
            "orders_m2m_products",
            "orders",
            "products_m2m_vendors",
            "products",
            "order_statuses",
            "id_order",
            "id_product_m2m_vendor",
            "id_product",
            "id_order_status",
            { id_user },
            "orders.id_order",
            "DESC"
        )
        console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",response)
        const orders = []
        const code = []
        const products = []

        response.map((item) => {
            if (!orders.includes(item.id_order)) {
                orders.push(item.id_order)
                item.quantity = 1
                code.push(item.id_product_m2m_vendor)
                products.push(item)
            } else {
                const index = code.indexOf(item.id_product_m2m_vendor)
                products[index].quantity++
            }
        })

        return handler.returner([true, products], api_name)
    } catch (e) {
        let errors = await handler.required_field_error(e)
        console.log(errors)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
