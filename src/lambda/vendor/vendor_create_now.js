const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")
const send = require("../../lib/services/email/send_email")
const Cryptr = require("cryptr")
const secret = process.env.mySecret
const cryptr = new Cryptr(`${secret}`)

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

const api_name = "Vendor create now"
const custom_errors = [
    "body is empty",
    "Verification code invalid!",
    "Invalid first name",
    "Invalid last name",
    "Email already exist",
    "Phone number is taken",
    "Business name is taken",
    "Vendor status is invalid",
    "Vendor create not successful",
    "Something went wrong",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}
const email_info = {
    subject: "Email Verification",
    message: "Please click here to verify your email\n\n\n\n",
} // we can send  HTML template insted of messgae

exports.handler = async (event) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)
        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)
        //more error handling
        const required_fields = [
            "user_first_name",
            "user_last_name",
            "business_name",
            "vendor_email",
            "vendor_phone_number",
            "vendor_address",
            "vendor_short_desc",
            "id_vendor_status",
            "vendor_password",
            "id_user_access_level",
            "city",
            "country",
            "verification_code",
            "acquirer_location",
        ]
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))
        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }
        const {
            user_first_name,
            user_last_name,
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
            verification_code,
            acquirer_location,
        } = body

        // Check if code is in the database
        const code_exist = (
            await db.select_all_with_condition("verification_codes", {
                code: verification_code,
            })
        )[0]

        if (!code_exist) {
            throw `${custom_errors[1]}`
        }

        if (code_exist.acquirer_id) {
            throw `${custom_errors[1]}`
        }

        const nameValidator1 = /[\d\s$&+,:;=?@#|'<>.^*()%!-]|(.)\1\1/gm
        const nameValidator2 = /[\d\s$&+,:;=?@#|'<>.^*()%!-]|(.)\1/gm

        const valid_first_name =
            (user_first_name.length > 2 && !nameValidator1.test(user_first_name)) ||
            (user_first_name.length = 2 && !nameValidator2.test(user_first_name))
                ? user_first_name
                : undefined

        const valid_last_name =
            (user_last_name.length > 2 && !nameValidator1.test(user_last_name)) ||
            (user_last_name.length = 2 && !nameValidator2.test(user_last_name))
                ? user_last_name
                : undefined

        if (!valid_first_name) {
            throw `${custom_errors[2]}`
        }

        if (!valid_last_name) {
            throw `${custom_errors[3]}`
        }

        const email_exist = (await db.search_one("users", "user_email", vendor_email))[0]
        if (email_exist) {
            throw `${custom_errors[4]}`
        }

        const phone_exist = (
            await db.select_all_from_join2_with_2conditions(
                "users",
                "vendors",
                "id_vendor",
                { vendor_phone_number },
                { user_phone_number: vendor_phone_number }
            )
        )[0]

        if (phone_exist) {
            throw `${custom_errors[5]}`
        }

        const vendor_exist = (await db.select_all_with_condition("vendors", { business_name }))[0]

        if (vendor_exist) {
            throw `${custom_errors[6]}`
        }

        const vendorStatusId = (
            await db.select_all_with_condition("vendor_statuses", {
                id_vendor_status,
            })
        )[0]

        if (!vendorStatusId) {
            throw `${custom_errors[7]}`
        }

        const password_hashed = await passwordHash(vendor_password)

        const userData = {
            user_first_name: valid_first_name,
            user_last_name: valid_last_name,
            user_email: vendor_email,
            user_phone_number: vendor_phone_number,
            user_password: password_hashed,
            user_datetime_created: datetime,
            id_user_status: 1,
            id_user_title: 1,
            email_verified: 1,
            phone_verified: 0,
            city: city,
            country: country,
        }

        const new_user = await db.insert_new(userData, "users")

        if (!new_user) {
            throw `${custom_errors[8]}`
        }

        const id_user = new_user.insertId

        const vendorData = {
            business_name,
            vendor_phone_number,
            vendor_address,
            vendor_short_desc,
            id_vendor_status,
            vendor_country: country,
        }

        const new_vendor = await db.insert_new(vendorData, "vendors")

        if (!new_vendor) {
            throw `${custom_errors[8]}`
        }
        const id_vendor = new_vendor.insertId

        const updated = await db.update_one("users", { id_vendor }, "id_user", id_user)

        if (updated.affectedRows !== 1) {
            throw `${custom_errors[9]}`
        }

        // Update the verification codes table
        let verification_table_data = {
            acquirer_id: id_user,
            datetime_expended: datetime,
            acquirer_location,
        }

        if (code_exist.code !== "utopia123develop") {
            await db.update_with_condition("verification_codes", verification_table_data, {
                id_code: code_exist.id_code,
            })
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

        const verification_token = cryptr.encrypt(`${id_user}`)

        email_info.message += `${process.env.EMAIL_LINK}user-verification/email/${verification_token}`
        await send.email_result(vendor_email, email_info)

        return handler.returner([true, data], api_name, 201)
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
