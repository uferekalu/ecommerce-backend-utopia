const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"

exports.handler = async (event, context) => {
    try {
        const query = event.pathParameters

        const limit = 20

        const vendors = await db.select_and_limit("vendors", "id_vendor", query.index, limit)

        if (vendors.length < 1) {
            throw "No vendor found"
        }

        const data = vendors.map((vendor) => vendor.business_name)

        return handler.returner([true, data], api_name, 200)
    } catch (e) {
        return handler.returner([false, e], api_name, 400)
    }
}
