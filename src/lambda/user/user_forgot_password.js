const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")
const send = require("../../lib/services/email/send_email")

const api_name = "Forgot Password";
const email_info = {
    subject: "Forgot Password",
    message: "Your new password is ",
} // we can send  HTML template insted of messgae

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
}
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        //get type of user_id hase been sent(email or phone)
        const type = body.type
        let user_id_exist = []
        if (type === "email") {
            user_id_exist = await db.search_one("users", "user_email", body.user_email)
        } else if (type === "phone") {
            user_id_exist = await db.search_one("users", "user_phone_number", body.user_phone_number)
        }

        if (user_id_exist.length == 0)
            return handler.returner(
                [false, { message: `${body.user_email || body.user_phone_number} is not found` }],
                api_name,
                201
            )

        // create new pasword    
        var randomString = Math.random().toString(36).substr(2, 8);
        const new_password_hashed = await passwordHash(randomString);
        user_id_exist[0].user_password = new_password_hashed;

        //update user
        await db.update_one("users", user_id_exist[0], "id_user", user_id_exist[0].id_user)

        //Send email 
        email_info.message += randomString;
        await send.send_email(user_id_exist[0].user_email, email_info);
        
        return handler.returner(
            [true, { user_email: user_id_exist[0].user_email, message: "New password sent to your email address" }],
            api_name,
            201
        )
    } catch (e) {
        console.log("Error: ", e)
        return handler.returner([false, e], api_name)
    }
}
