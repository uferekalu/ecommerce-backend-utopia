const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Comp leaders details get"

exports.handler = async (event, context) => {
    try {
        const employees = await db.select_all_from_join2_with_condition(
            "employees",
            "employee_positions",
            "id_employee_position",
            12,
            "employees.id_employee_position"
        )

        console.log(employees)

        return handler.returner([true, { employees }], api_name, 200)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
