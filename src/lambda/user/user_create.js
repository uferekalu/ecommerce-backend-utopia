const handler = require("../../middleware/handler")
const auth_token = require("../../middleware/token_handler")
const db = require("../../lib/database/query")
const send = require("../../lib/services/email/send_email")
const bcrypt = require("bcryptjs")
const Cryptr = require("cryptr")
const cryptr = new Cryptr("myTotalySecretKey")

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}

const api_name = "User create"
const custom_errors = [
    "body is empty",
    "Email already exist",
    "Phone number is taken",
    "Invalid referral code",
    "User create unsuccessful",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "customError"
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
            ...others
        } = body

        const email_exist = await db.search_one("users", "user_email", user_email)
        if (email_exist.length != 0) {
            throw `${custom_errors[1]}`
        }

        const phone_exist = await db.search_one("users", "user_phone_number", user_phone_number)
        if (phone_exist.length != 0) {
            throw `${custom_errors[2]}`
        }

        if (referral_code) {
            const referee = (await db.select_one("referral_codes", { referral_code }))[0]
            if (!referee) throw `${custom_errors[3]}`
            const { total_conversions } = referee
            accum_converts = total_conversions + 1
        }

        const password_hashed = await passwordHash(user_password)

        const record = {
            user_first_name,
            user_last_name,
            user_email,
            user_phone_number,
            user_password: password_hashed,
            user_datetime_created: datetime,
            ...others,
        }

        const result = await db.insert_new(record, "users")

        delete record.user_password

        if (!result) {
            throw `${custom_errors[4]}`
        }

        await db.update_with_condition(
            "referral_codes",
            { total_conversions: accum_converts },
            { referral_code }
        )

        //get the id_user
        const user_id = await db.select_oneColumn(
            "users",
            "id_user",
            "user_email",
            record.user_email
        )

        const userAccessRecord = {
            id_id_user: user_id[0].id_user,
            id_user_access_level,
        }

        await db.insert_new(userAccessRecord, "user_access_level_m2m_users")

        const id_hashed = cryptr.encrypt(result.insertId)
        email_info.message += `https://4l0nq44u0k.execute-api.us-east-2.amazonaws.com/staging/api/user_email_verify/${id_hashed}`

        await send.send_email(user_email, email_info)

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
