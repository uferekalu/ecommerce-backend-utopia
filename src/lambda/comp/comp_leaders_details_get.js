const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Comp leaders details get"
const error_one = "No leader found"

exports.handler = async (event, context) => {
    try {
        const employees = await db.select_all_from_join2_with_condition(
            "employees",
            "employee_positions",
            "id_employee_position",
            "employee_positions.id_employee_position > 2"
        )

        if (employees.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, employees], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
