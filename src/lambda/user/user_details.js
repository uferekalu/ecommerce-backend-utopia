const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "User details"
const error_one = "user not found"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_user } = param
        let user

        // Check if the user has an image
         user = (
            await db.select_all_from_join_with_condition(
                "users",
                "user_profile_images",
                "id_user_profile_image",
                { id_user }
            )
        )[0]

        // If there is no image, check if the user exists
        if (!user) {
            user = (await db.select_one("users", { id_user }))[0]
        }

        if (!user) {
            throw `${error_one}`
        }

        delete user.user_password

        return handler.returner([true, user], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
