const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

const api_name = "Vendor create now"
const errors_array = [
    "body is empty",
    "Email already exist",
    "Phone number is taken",
    "Business name is taken",
    "Vendor status is invalid",
    "Vendor create not successful",
    "Something went wrong",
]

exports.handler = async (event) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)
        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }
        const all_fields = Object.keys(body)
        //more error handling
        const required_fields = [
            "business_name",
            "vendor_email",
            "vendor_phone_number",
            "vendor_address",
            "vendor_short_desc",
            "id_vendor_status",
            "vendor_password",
            "id_user_access_level",
        ]
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))
        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }
        const {
            business_name,
            vendor_email,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            id_vendor_status,
            vendor_password,
            id_user_access_level,
            city,
            country,
            ...others
        } = body

        const email_exist = await db.search_one("users", "user_email", vendor_email)
        if (email_exist.length != 0) {
            throw `${errors_array[1]}`
        }

        const phone_exist = await db.search_one(
            "vendors",
            "vendor_phone_number",
            vendor_phone_number
        )
        if (phone_exist.length != 0) {
            throw `${errors_array[2]}`
        }

        const vendor_exist = await db.search_one("vendors", "business_name", business_name)
        if (vendor_exist.length > 0) {
            throw `${errors_array[3]}`
        }

        const vendorStatusId = await db.search_one(
            "vendor_statuses",
            "id_vendor_status",
            id_vendor_status
        )
        if (vendorStatusId.length < 1) {
            throw `${errors_array[4]}`
        }

        const password_hashed = await passwordHash(vendor_password)

        const nameValidator = /[\d\s$&+,:;=?@#|'<>.^*()%!-]/gm

        const valid_first_name =
            others?.user_first_name && !nameValidator.test(others.user_first_name)
                ? others.user_first_name
                : undefined

        const valid_last_name =
            others?.user_last_name && !nameValidator.test(others.user_last_name)
                ? others.user_last_name
                : undefined
        ///
        const userData = {
            user_first_name: valid_first_name || business_name,
            user_last_name: valid_last_name || business_name,
            user_email: vendor_email,
            user_phone_number: vendor_phone_number,
            user_password: password_hashed,
            user_datetime_created: datetime,
            id_user_status: 1,
            id_user_title: 1,
            email_verified: 0,
            phone_verified: 0,
            city: city,
            country: country
        }

        const new_user = await db.insert_new(userData, "users")

        if (!new_user) {
            throw `${errors_array[5]}`
        }

        const id_user = new_user.insertId

        const vendorData = {
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            id_vendor_status,
            vendor_country: country
        }

        const new_vendor = await db.insert_new(vendorData, "vendors")
        if (!new_vendor) {
            throw `${errors_array[5]}`
        }
        const id_vendor = new_vendor.insertId

        const updated = await db.update_one("users", { id_vendor }, "id_user", id_user)

        if (updated.affectedRows !== 1) {
            throw `${errors_array[6]}`
        }

        await db.insert_new(
            {
                id_id_user: id_user,
                id_user_access_level,
            },
            "user_access_level_m2m_users"
        )

        const user_access_level = await handler.get_access_level(id_user_access_level)

        const data = { id_vendor, id_user, user_access_level, ...vendorData }
        delete data.id_vendor_status

        return handler.returner([true, data], api_name, 201)
    } catch (e) {
        let errors
        if (e.name === "Error") {
            errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")
        }

        if (errors_array.includes(e)) {
            errors = e
        }

        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}