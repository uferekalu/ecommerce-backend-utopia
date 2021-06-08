const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")

const api_name = "kill connection"
const errors = ["invalid password", "no sleep connections", "there has been an error"]

exports.handler = async (event) => {
    try {
        const param = event.pathParameters
        const { id_user, pass } = param

        const user = (await db.select_one("users", { id_user }))[0]
        const pass_valid = await bcrypt.compare(pass, user.user_password)

        if (!pass_valid) {
            throw `${errors[0]}`
        }

        const cons = await db.check_connections({ USER: "admin" }, { COMMAND: "Sleep" })
        console.log("Total connections: ", cons.length)

        if (cons.length < 1) {
            throw `${errors[1]}`
        }

        const mapped = cons.map(async (con) => {
            await db.kill_connections(con.ID)
        })

        await Promise.all(mapped)

        const conss = await db.check_connections({ USER: "admin" }, { COMMAND: "Sleep" })

        if (conss.length !== 0) {
            throw `${errors[2]}`
        }

        return handler.returner([true, { message: "operation successful" }], api_name)
    } catch (e) {
        if (errors.includes(e)) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
