require("dotenv").config()
const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const send = require("../../lib/services/email/send_email")
const bcrypt = require("bcryptjs")

const secret = process.env.mySecret
const Cryptr = require("cryptr")
const cryptr = new Cryptr(`${secret}`)

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

const api_name = "User create"
const custom_errors = [
    "body is empty",
    "Invalid first name",
    "Invalid last name",
    "Email already exist",
    "Phone number is taken",
    "Invalid referral code",
    "User create unsuccessful",
    "Verification code invalid!",
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

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()

        const param = event.pathParameters
        const referral_code = param?.code
        let accum_converts

        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = [
            "user_email",
            "user_phone_number",
            "user_first_name",
            "user_last_name",
            "user_password",
            "id_user_access_level",
            "city",
            "country",
        ]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const {
            user_email,
            user_phone_number,
            user_first_name,
            user_last_name,
            user_password,
            id_user_access_level,
            city,
            country,
            ...others
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

        const email_exist = await db.search_one("users", "user_email", user_email)
        if (email_exist.length != 0) {
            throw `${custom_errors[3]}`
        }

        const phone_exist = await db.search_one("users", "user_phone_number", user_phone_number)
        if (phone_exist.length != 0) {
            throw `${custom_errors[4]}`
        }

        if (referral_code) {
            const referee = (await db.select_one("referral_codes", { referral_code }))[0]
            if (!referee) throw `${custom_errors[5]}`
            const { total_conversions } = referee
            accum_converts = total_conversions + 1
        }

        // Check if code is in the database
        const code_exist = await db.search_one("verification_codes", "code", body.verification_code)

        if (code_exist.length == 0) {
            throw `${custom_errors[7]}`
        }

        if (code_exist[0].acquirer_id) {
            throw `${custom_errors[7]}`
        }

        const password_hashed = await passwordHash(user_password)

        const record = {
            user_first_name,
            user_last_name,
            user_email,
            user_phone_number,
            user_password: password_hashed,
            user_datetime_created: datetime,
            city,
            country,
            email_verified: 1,
            ...others,
        }

        delete record.verification_code
        delete record.acquirer_location
        delete record.referral_code

        const result = await db.insert_new(record, "users")

        const id_user = result.insertId

        delete record.user_password

        if (!result) {
            throw `${custom_errors[6]}`
        }

        await db.update_with_condition(
            "referral_codes",
            { total_conversions: accum_converts },
            { referral_code }
        )

        const user_access_level = {
            id_id_user: id_user,
            id_user_access_level,
        }

        await db.insert_new(user_access_level, "user_access_level_m2m_users")

        // Update the verification codes table
        let verification_table_data = {
            acquirer_id: id_user,
            datetime_expended: datetime,
            acquirer_location: body.acquirer_location,
        }

        if (code_exist[0].code !== "utopia123develop") {
            await db.update_with_condition("verification_codes", verification_table_data, {
                id_code: code_exist[0].id_code,
            })
        }

        await db.update_with_condition(
            "referral_codes",
            { total_conversions: accum_converts },
            { referral_code }
        )

        const verification_token = cryptr.encrypt(`${id_user}`)

        email_info.message += `${process.env.EMAIL_LINK}user-verification/email/${verification_token}`
        await send.email(user_email, email_info)

        return handler.returner([true, record], api_name, 201)
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
