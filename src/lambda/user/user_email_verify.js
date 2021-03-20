const handler = require('../../middleware/handler')
const db = require('../../lib/database/db_query')

const api_name = "User's email verify"

exports.handler = async (event, context) => {
    try {
        const id = Number(event.pathParameters.id)
        let result = await db.search_id(id)

        if (result.length == 0)
            return handler.returner([false, { message: "The user belongs to this id is not exist" }], api_name, 404)

        const updated_data = { email_verified: 1 }
        const update = await db.update_one(updated_data, "users", id)
       
        if (update.affectedRows)
            return handler.returner([true, { message: "Account Verification Successful" }], api_name, 200)

    } catch (e) {
        console.log("error", e)
        return handler.returner([false, e], api_name, 500)
    }
};