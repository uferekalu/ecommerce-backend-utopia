const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendor details"
const error_one = "vendor not found"

exports.handler = async (event, context) => {
    try {
        const id_vendor = event.pathParameters.id_vendor

        const vendor = await db.search_one("vendors", "id_vendor", id_vendor)

        if (vendor.length < 1) {
            throw `${error_one}`
        }

        const data = vendor[0]
        delete data.created_at
        delete data.updated_at

        return handler.returner([true, data], api_name)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 404)
        }

        return handler.returner([false], api_name, 500)
    }
}
