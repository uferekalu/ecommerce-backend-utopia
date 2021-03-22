const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

const api_name = "User's email verify"

exports.handler = async (event, context) => {
    try {
        const decrypted_id = cryptr.decrypt(event.pathParameters.id_user);

        let result = await db.search_one("users", "id_user", decrypted_id)
        if (result.length == 0)
            return handler.returner([false, { message: "The user belongs to this id is not exist" }], api_name, 404)

        const updated_data = {
            email_verified: 1
        }

        const update = await db.update_one("users",updated_data ,"id_user",decrypted_id)

        if (update.affectedRows)
            return handler.returner([true, { message: "Account Verification Successful" }], api_name, 200)

    } catch (e) {
        console.log("error", e)
        return handler.returner([false, e], api_name, 500)
    }
};