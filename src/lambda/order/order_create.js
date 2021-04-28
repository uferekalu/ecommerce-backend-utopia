const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')

const api_name = 'Order create'

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
        const required_fields = [ "id_user", "id_product_m2m_vendor"]

        const missing_fields = required_fields.filter(field => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { id_user, id_product_m2m_vendor } = body

        // ensure user exists
        const user_exist = await db.search_one(
            "users",
            "id_user",
            id_user
        )

        //if user does not exist return error
        if (user_exist.length === 0) {
            return handler.returner(
                [false, { message: "User is not found" }],
                api_name,
                404
            )
        }

        // extract order_m2m_product record using the condition id_product_m2m_vendor
        const order_m2m_product = await db.search_one(
            "orders_m2m_products",
            "id_product_m2m_vendor",
            id_product_m2m_vendor
        )
        //if product order record doesnt exist return error
        if (order_m2m_product.length === 0) {
            return handler.returner([false, { message: "Product order does not exist" }], api_name, 404)
        }

        // retrieve the id_order_m2m_product
        const { id_order_m2m_product } = order_m2m_product[0]

        const data = { 
            id_order_m2m_product, 
            id_user, 
            total, 
            created_at: 
            datetime, 
            paymentMethod, 
            isPaid: 1
        }
        const result = await db.insert_new(data, "orders")

        if (result) {
            return handler.returner([true, data], api_name, 201)
        }

    } catch (e) {
        if (e.name === "Error") {
          const errors = e.message
            .split(",")
            .map(field => {
              return `${field} is required`
            })
            .join(", ")
    
          return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 400)
    }
}