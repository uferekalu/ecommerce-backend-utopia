const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const token = require('../../middleware/verify_token')

const api_name = 'Product review create'

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        const { id_product_m2m_vendor, product_review, id_order_m2m_product } = body
        
        const product_m2m_vendor_exist = await db.search_one( "products_m2m_vendors","id_product_m2m_vendor", id_product_m2m_vendor)

        if (product_m2m_vendor_exist.length == 0) {
            console.log("Product is not found for review")
            return handler.returner([false, { message: "Product is not found for review" }], api_name, 404)
        } else {
            // const created_token = await token.create_token(id_product_review)

            const orderM2MproductId = await db.search_one("orders_m2m_products", "id_order_m2m_product", id_product_m2m_vendor)

            if (orderM2MproductId) {
                const result = await db.insert_new(product_review, "product_reviews")
                if (result) {
                    return handler.returner(
                        [true, 
                            { 
                                message: "Product review created successfully", 
                                data: product_review,
                                token: created_token  
                            }
                        ], 
                        api_name, 
                        201
                    )
                }
            }
        }   

    } catch (e) {
        console.log("Error: ", e);
        return handler.returner([false, e.toString()], api_name, 500);
    }
}