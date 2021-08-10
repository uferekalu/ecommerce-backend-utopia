require("dotenv").config()
const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const secret = process.env.mySecret
const auth_token = require("../../middleware/token_handler");
const send = require("../../lib/services/email/send_email");
const vendor_sales_html = require("../../lib/templates/emails/vendor_sales_updates");
const uuid = require('uuid');

const api_name = "User Email or Phone verify"
const custom_errors = ["body is empty", "user not found", "invalid verification code"]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        const required_fields = ["verification_code"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        let user, update
        // let response = {}

        const user_email = body?.user_email
        // const user_phone_number = body?.user_phone_number

        if (user_email) {
            update = { email_verified: 1 }
            // user = (
            //     await db.select_all_from_join3_with_condition(
            //         "users",
            //         "verification_codes",
            //         "vendors",
            //         "id_user",
            //         "id_vendor",
            //         { user_email }
            //     )
            // )[0]

            user = (
                await db.select_all_from_join_with_condition(
                    "users",
                    "verification_codes",
                    "id_user",
                    { user_email }
                )
            )[0]
        }

        // if (user_phone_number) {
        //     update = { phone_verified: 1 }
        //     user = (
        //         await db.select_all_from_join3_with_condition(
        //             "verification_codes",
        //             "users",
        //             "vendors",
        //             "id_user",
        //             "id_vendor",
        //             { user_phone_number }
        //         )
        //     )[0]
        // }

        if (!user) {
            throw `${custom_errors[1]}`
        }

        if (body.verification_code !== user.verification_code) {
            throw `${custom_errors[2]}`
        }

        const { id_user, user_firs_name, user_last_name, city, country } = user

        // response = { id_user, user_firs_name, user_last_name, city, country }

        await db.update_with_condition("users", update, { id_user })

        if (user?.id_vendor) {

            const { id_vendor, user_email } = user;

            await db.update_one("vendors", { id_vendor_status: 2 }, "id_vendor", id_vendor);

            const vendor = (
                await db.select_all_with_condition(
                    "vendors",
                    { id_vendor }
                )
            )[0]

            if (vendor) {
                const { business_name, business_abn, vendor_phone_number,
                    vendor_address, vendor_country } = vendor;

                const token = uuid.v4();

                await db.update_one("vendors", { token }, "id_vendor", id_vendor);

                const html = vendor_sales_html({
                    business_name, business_abn, vendor_phone_number,
                    vendor_address, user_email,
                    vendor_country: vendor_country,
                    verification_link: process.env.BASE_URL + `/verify/documents/${token}`
                })

                const result = await send.email({
                    user_first_name: `Sales Team`,
                    user_email: process.env.SALES_EMAIL,
                    subject: `New Vendor Registration (${business_name})`,
                    message: html
                })

                console.log(result, 'EMAIL Result')
            }

        }

        return handler.returner([true, { message: "email verified successfully" }], api_name, 201)
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        console.log(e.message)
        return handler.returner([false], api_name, 500)
    }
}
