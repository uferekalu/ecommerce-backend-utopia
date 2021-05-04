const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const token = require('../../middleware/verify_token')

const api_name = 'Vendor update'

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        const id_vendor = JSON.parse(event.pathParameters.id_vendor);
        
        const { 
            business_name, 
            business_abn, 
            vendor_phone_number,
            vendor_address,
            vendor_long_desc,
            vendor_short_desc,
            vendor_coverphoto,
            vendor_photo,
            id_vendor_status
        } = body
        
        const vendor_exist = await db.search_one( "vendors","id_vendor", id_vendor)
        const vendor_business_exist = await db.search_one( "vendors","business_name", business_name)

        if (vendor_exist.length == 0) {
            console.log("Vendor is not found")
            return handler.returner([false, { message: "Vendor is not found" }], api_name, 404)
        } else if (vendor_business_exist.length != 0) {
            console.log("Vendor already exists")
            return handler.returner([false, { message: "Vendor already exists" }], api_name, 404)
        } else  {
            const created_token = await token.create_token(id_vendor)

            const updated_data = {
                business_name: business_name,
                business_abn: business_abn,
                vendor_phone_number: vendor_phone_number,
                vendor_address: vendor_address,
                vendor_long_desc: vendor_long_desc,
                vendor_short_desc: vendor_short_desc,
                vendor_coverphoto: vendor_coverphoto,
                vendor_photo: vendor_photo,
                id_vendor_status: id_vendor_status,
                created_at: datetime,
                updated_at: datetime

            }

            const update = await db.update_one(
                "vendors",
                updated_data,
                "id_vendor",
                id_vendor
            );

            if (update) {
                return handler.returner(
                    [true, 
                        { 
                            message: "Vendor updated successfully", 
                            data: updated_data,
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