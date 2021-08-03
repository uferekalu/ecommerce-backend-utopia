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
    "Invalid first name",
    "Invalid last name",
    "Email already exist",
    "Phone number is taken",
    "Business name is taken",
    "Vendor status is invalid",
    "Vendor create not successful",
    "Something went wrong",
    "Business Id exists",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

const email_info = {
    user_email: "",
    user_first_name: "",
    subject: "Email Verification",
    message: "Here is your verification code ",
}

exports.handler = async (event) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)
        console.log("body from vendor create now:", body)
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
            "business_abn",
            "vendor_email",
            "vendor_phone_number",
            "vendor_address",
            "vendor_short_desc",
            "id_vendor_status",
            "vendor_password",
            "id_user_access_level",
            "city",
            "country",
        ]
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))
        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }
        const {
            user_first_name,
            user_last_name,
            business_name,
            business_abn,
            vendor_email,
            vendor_phone_number,
            vendor_address,
            business_abn,
            vendor_short_desc,
            id_vendor_status,
            vendor_password,
            id_user_access_level,
            city,
            country,
        } = body

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
            throw `${custom_errors[1]}`
        }

        if (!valid_last_name) {
            throw `${custom_errors[2]}`
        }

        const email_exist = (await db.search_one("users", "user_email", vendor_email))[0]

        if (email_exist) {
            throw `${custom_errors[3]}`
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
            throw `${custom_errors[4]}`
        }

        const business_abn_exist = (await db.search_one("vendors", "business_abn", business_abn))[0]

        if (business_abn_exist) {
            throw `${custom_errors[9]}`
        }

        const vendor_exist = (await db.select_all_with_condition("vendors", { business_name }))[0]

        if (vendor_exist) {
            throw `${custom_errors[5]}`
        }
        const vendor_abn_exist = (
            await db.select_all_with_condition("vendors", { business_abn })
        )[0]

        if (vendor_abn_exist) {
            throw `${custom_errors[9]}`
        }

        const vendorStatusId = (
            await db.select_all_with_condition("vendor_statuses", {
                id_vendor_status,
            })
        )[0]

        if (!vendorStatusId) {
            throw `${custom_errors[6]}`
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
            city: city,
            country: country,
        }

        const new_user = await db.insert_new(userData, "users")

        if (!new_user) {
            throw `${custom_errors[7]}`
        }

        const id_user = new_user.insertId

        const vendorData = {
            business_name,
            business_abn,
            vendor_phone_number,
            vendor_address,
            business_abn,
            vendor_short_desc,
            id_vendor_status,
            vendor_country: country,
        }

        const new_vendor = await db.insert_new(vendorData, "vendors")

        if (!new_vendor) {
            throw `${custom_errors[7]}`
        }
        const id_vendor = new_vendor.insertId

        const updated = await db.update_one("users", { id_vendor }, "id_user", id_user)

        if (updated.affectedRows !== 1) {
            throw `${custom_errors[8]}`
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

        const verification_code = Math.random().toString(36).substr(2, 8)

        await db.insert_new(
            { verification_code, id_user, datetime_generated: datetime },
            "verification_codes"
        )

        email_info.user_first_name = user_first_name
        email_info.user_email = vendor_email
        email_info.message += `<b>${verification_code}</b>`

        const email_sent = await send.email(email_info)

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
