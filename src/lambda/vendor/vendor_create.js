const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
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
            "id_user",
            "business_name",
            "vendor_phone_number",
            "vendor_address",
            "vendor_short_desc",
        ]

        const dateTime = await handler.datetime()

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))
        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }
        const {
            id_user,
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            ...others
        } = body

        const isUser = await db.search_one("users", "id_user", id_user)

        if (isUser.length === 0) {
            throw "you have to be a registered user to become a vendor"
        }

        const vendor_exist = await db.search_one("vendors", "business_name", business_name)

        if (vendor_exist.length > 0) {
            throw "Business name is taken"
        }
        const data = {
            ...others,
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            created_at: dateTime,
        }
        const newVendorRecord = await db.insert_new(data, "vendors")
        if (!newVendorRecord) {
            throw "Vendor create not successful"
        }

        const id_vendor = newVendorRecord.insertId

        const updated = await db.update_one("users", { id_vendor }, "id_user", id_user)

        if (updated.affectedRows !== 1) {
            throw "user update unsuccessfull"
        }

        return handler.returner(
            [
                true,
                {
                    ...data,
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
