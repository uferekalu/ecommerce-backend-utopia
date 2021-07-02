const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Vendor full details get"
const errors_array = ["body is empty", "authentication required", "no vendor found"]

exports.handler = async (event, context) => {
    try {
        const id_vendor = event.pathParameters.id_vendor

        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw errors_array[0]
        }

        console.log(body);
        console.log(id_vendor);

        const all_fields = Object.keys(body)

        const required_fields = ["token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { token } = body

        const id_user = await auth_token.verify(token)

        console.log(id_user);

        if (!id_user) {
            throw errors_array[1]
        }

        const data = await db.select_all_from_join_with_condition("vendors", "users", "id_vendor", {
            "vendors.id_vendor": id_vendor,
        })

        if (data.length < 1) {
            throw errors_array[2]
        }

        delete data[0].user_password

        return handler.returner([true, data[0]], api_name, 200)
    } catch (e) {
        if (e === errors_array[0] || e === errors_array[2]) {
            return handler.returner([false, e], api_name, 404)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
