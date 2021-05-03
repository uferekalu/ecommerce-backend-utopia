const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const token = require("../../middleware/verify_token")
const api_name = "Vendor create"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }
        const all_fields = Object.keys(body)
        //more error handling
        const required_fields = [
            "business_name",
            "vendor_phone_number",
            "vendor_address",
            "vendor_short_desc",
            "id_vendor_status",
        ]
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))
        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }
        const {
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            id_vendor_status,
            ...others
        } = body
        const vendorStatusId = await db.search_one(
            "vendor_statuses",
            "id_vendor_status",
            id_vendor_status
        )
        if (vendorStatusId.length < 1) {
            throw "Vendor status is invalid"
        }
        const data = {
            ...others,
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            id_vendor_status,
        }
        const newVendorRecord = await db.insert_new(data, "vendors")
        if (!newVendorRecord) {
            throw "Vendor create not successful"
        }
        return handler.returner(
            [
                true,
                {
                    data,
                },
            ],
            api_name,
            201
        )
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
