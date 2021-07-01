const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
//-------------gets id_user in url

const api_name = "User's email verify id user"

exports.handler = async (event, context) => {
    try {
        const id = event.pathParameters.id_user

        let result = await db.search_one("users", "id_user", id)
        if (result.length == 0) {
            return handler.returner(
                [false, { message: "The user belongs to this id is not exist" }],
                api_name,
                404
            )
        } else {
            return handler.returner(
                [true, { message: "Account Verification Successful" }],
                api_name,
                200
            )
        }
    } catch (e) {
        console.log("error", e)
        return handler.returner([false], api_name, 500)
    }
}
