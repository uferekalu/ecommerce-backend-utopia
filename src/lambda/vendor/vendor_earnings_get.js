const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendor earnings get"
const error_one = "vendor not found"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_vendor } = param

        const vendor = await db.search_one("vendors", "id_vendor", id_vendor)

        if (vendor.length < 1) {
            throw `${error_one}`
        }
        let data = []

        data = await db.select_sum_of_1column_1condition(
            "vendor_payment_details",
            "bsb",
            { "id_vendor": id_vendor }
        )

        // if (data.length < 1) {
        //     throw `${error_two}`
        // }

        return handler.returner([true, data], api_name, 200)
    } catch (e) {
        // if (e === error_one || e === error_two) {
        //     return handler.returner([false, e], api_name, 404)
        // }
        return handler.returner([false, e], api_name, 500)
    }
}
