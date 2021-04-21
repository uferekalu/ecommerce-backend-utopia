const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const token = require('../../middleware/verify_token')

const api_name = 'Vendor review create'

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        const { id_vendor, id_order_m2m_product, vendor_review } = body

        // const id_vendor = event.queryStringParameters.id_vendor;
        
        const vendor_exist = await db.search_one( "vendors","id_vendor", id_vendor)

        if (vendor_exist.length == 0) {
            console.log("Vendor is not found")
            return handler.returner([false, { message: "Vendor is not found" }], api_name, 404)
        } else {
            const created_token = await token.create_token(id_vendor)

            const data = {
                id_order_m2m_product: id_order_m2m_product,
                vendor_review: vendor_review,
                vr_datetime_created: datetime
            }

            const result = await db.insert_new(data, "vendor_reviews");
            if (result) {
                return handler.returner(
                    [true, 
                        { 
                            message: "Vendor review created successfully", 
                            data: data,
                            token: created_token  
                        }
                    ], 
                    api_name, 
                    201
                )
            }
        }   

    } catch (e) {
        console.log("Error: ", e);
        return handler.returner([false, e.toString()], api_name, 500);
    }
}