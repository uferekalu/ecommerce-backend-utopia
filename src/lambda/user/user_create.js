const handler = require("../../middleware/handler")
const auth_token = require("../../middleware/verify_token")
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
const email_info = {
    subject: "Email Verification",
    message: "Please click here to verify your email\n\n\n\n",
} // we can send  HTML template insted of messgae

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        const required_fields = [
            "user_email",
            "user_phone_number",
            "user_first_name",
            "user_last_name",
            "user_password",
            "id_user_title",
        ]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const {
            user_email,
            user_phone_number,
            user_first_name,
            user_last_name,
            user_password,
            id_user_title,
            ...others
        } = body

        const email_exist = await db.search_one("users", "user_email", user_email)
        if (email_exist.length != 0) {
            throw "Email already exist"
        }

        const phone_exist = await db.search_one("users", "user_phone_number", user_phone_number)
        if (phone_exist.length != 0) {
            throw "Phone number is taken"
        }

        const password_hashed = await passwordHash(user_password)

        const record = {
            user_first_name,
            user_last_name,
            user_email,
            user_phone_number,
            user_password: password_hashed,
            user_datetime_created: datetime,
            id_user_status: 1,
            // id_user_access_level: 0,
            id_user_title,
            email_verified: 0,
            ...others,
        }

        const result = await db.insert_new(record, "users")

        delete record.user_password

        if (!result) {
            throw "user create unsuccessful"
        }
        //get the id_user
        const user_id = await db.select_oneColumn(
            "users",
            "id_user",
            "user_email",

            record.user_email
        )
        console.log("user_id", user_id[0].id_user)
        //When a user is registered he is a buyer, so we nned add the 0 as the accesslevel by deafult
        const userAccessRecord = {
            id_id_user: user_id[0].id_user,
            id_user_access_level: 0,
        }
        const result2 = await db.insert_new(userAccessRecord, "user_access_level_m2m_users")

        const id_hashed = cryptr.encrypt(result.insertId)
        email_info.message += `https://4l0nq44u0k.execute-api.us-east-2.amazonaws.com/staging/api/user_email_verify/${id_hashed}`

        await send.send_email(user_email, email_info)

        // const token = auth_token.create_token(result.insertId)

        // const auth_token_data = {
        //     token: token,
        //     id_user: result.insertId,
        //     ut_datetime_created: datetime,
        // }

        // await db.insert_new(auth_token_data, "user_tokens")

        // const data = {
        //     message: "Created account successful",
        //     id_user: result.insertId,
        //     ...record,
        //     token,
        // }

        // return handler.returner([true, data], api_name, 201)
        return handler.returner([true, { message: "Created account successful" }], api_name, 201)
        // [false, { message: "Order status is not found" }],
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
