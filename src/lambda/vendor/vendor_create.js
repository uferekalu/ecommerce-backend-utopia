const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const api_name = "Vendor create"

const custom_errors = [
    "body is empty",
    "you have to be a registered user to become a vendor",
    "Business name is taken",
    "Vendor create not successful",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
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
            throw new CustomError(missing_fields)
        }
        const {
            id_user,
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            ...others
        } = body

        const isUser = (await db.select_all_with_condition("users", { id_user }))[0]

        if (!isUser) {
            throw `${custom_errors[1]}`
        }

        const vendor_exist = (await db.select_all_with_condition("vendors", { business_name }))[0]

        if (vendor_exist) {
            throw `${custom_errors[2]}`
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
            throw `${custom_errors[3]}`
        }

        const id_vendor = newVendorRecord.insertId

        await db.update_with_condition("users", { id_vendor }, { id_user })

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
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
