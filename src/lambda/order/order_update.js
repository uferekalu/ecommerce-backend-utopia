const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")

const api_name = "Order update"
const errors_array = [
    "body is empty",
    "authentication required",
    "order not found",
    "there is nothing to update",
]

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${errors_array[0]}`
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["id_order", "token"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { id_order, token, ...others } = body

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${errors_array[1]}`
        }

        const order_exist = (
            await db.select_one_with_2conditions("orders", { id_order }, { id_user })
        )[0]

        if (!order_exist) {
            throw `${errors_array[2]}`
        }

        if (all_fields.includes("id_user")) {
            delete others.id_user
        }

        if (Object.keys(others).length < 1) {
            throw `${errors_array[3]}`
        }

        const data = { ...others }

        await db.update_with_condition("orders", data, { id_order })

        return handler.returner([true, { message: "Order updated successfully" }], api_name, 201)
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
        return handler.returner([false, e], api_name, 500)
    }
}
