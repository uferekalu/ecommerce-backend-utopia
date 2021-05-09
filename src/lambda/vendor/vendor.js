const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"

exports.handler = async (event, context) => {
    try {
        const query = event.pathParameters

        const limit = 10

        const search_vendor = await db.select_and_limit(
            "vendors",
            "id_vendor",
            query.index,
            limit
        )

        if (search_vendor.length < 1) {
            throw "No vendor found"
        }

        const { business_name, business_abn, vendor_address, id_vendor_status } = search_vendor[0]

        const data = {
            business_name,
            business_abn,
            vendor_address,
            id_vendor_status
        }

        return handler.returner([true, data], api_name, 200)

    } catch (e) {
        if (e.name === "Error") {
            const errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")

            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 400)
    }
}