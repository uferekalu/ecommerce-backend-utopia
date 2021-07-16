const handler = require("./src/middleware/handler")
const db = require("./src/lib/database/query")
let generate_codes = async () => {
    for (i = 0; i < 25; i++) {
        let data = {
            code: "",
            issuer_name: "utopia",
            acquirer_location: "update",
            datetime_generated: await handler.datetime(),
        }
        data.code = Math.random().toString(36).substr(2, 10)
        const result = await db.insert_new(data, "verification_codes")
        console.log(result.insertId)
    }
}
generate_codes()