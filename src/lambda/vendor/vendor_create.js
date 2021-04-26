const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const token = require('../../middleware/verify_token')

const api_name = 'Vendor create'

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

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

        // const id_vendor = event.queryStringParameters.id_vendor;
        
        const vendor_exist = await db.search_one( "vendors","business_name", business_name)

        if (vendor_exist.length != 0) {
            console.log("Vendor already exists, you may want to update it")
            return handler.returner([false, { message: "Vendor already exists, you may want to update it" }], api_name, 404)
        } else {
            // const created_token = await token.create_token(id_vendor)

            const data = {
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

            const result = await db.insert_new(data, "vendors");
            if (result) {
                return handler.returner(
                    [true, 
                        { 
                            message: "Vendor created successfully", 
                            data: data,
                            
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