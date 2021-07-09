const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"

exports.handler = async (event, context) => {
    try {
        const { id_vendor } = event.pathParameters

        const columns = [
            "id_vendor",
            "business_name",
            "vendor_long_desc",
            "vendor_short_desc",
            "vendor_photo",
        ]

<<<<<<< HEAD
      //  console.log("THIS IS VENDOR ID: ", id_vendor)
=======
        const vendor_public_details = await db.select_columns_with_condictions(
            columns,
            "vendors",
            "id_vendor",
            id_vendor
        )
>>>>>>> 8d8107c9717b3b6aa3237a815a308f504313afcd

        return handler.returner([true, vendor_public_details[0]], api_name, 200)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
