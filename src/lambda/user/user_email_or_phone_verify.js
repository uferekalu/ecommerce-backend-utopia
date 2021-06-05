const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
//-----------requited data user_id(email id or phone number), type (email or phone)
//..........test
// {
//     "user_id":"11111",
//     "type":"phone "
// }
// {
//     "user_id":"anna@gmail.com",
//     "type":"email"
// }

const api_name = "User Email or Phone verify"
exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        //get type of user_id hase been sent(email or phone)
        const type = body.type
        console.log("type:", type)
        console.log("user_id:", body.user_id)
        let user_id_exist = []
        if (type === "email") {
            user_id_exist = await db.search_one("users", "user_email", body.user_id)
        } else if (type === "phone") {
            user_id_exist = await db.search_one("users", "user_phone_number", body.user_id)
        }

        if (user_id_exist.length == 0)
            return handler.returner(
                [false, { message: `${body.user_id} is not found` }],
                api_name,
                404
            )

        // const pass_valid = await bcrypt.compare(
        //   body.user_password,
        //   user_exist[0].user_password
        // );
        // if (!pass_valid)
        //   return handler.returner(
        //     [false, { message: "Password is invalid" }],
        //     api_name,
        //     400
        //   );

        // if (user_exist[0].email_verified != 1)
        //   return handler.returner(
        //     [false, { message: "Account is not verified" }],
        //     api_name,
        //     400
        //   );

        // const created_token = await token.create(user_exist[0].id_user);

        // let data = {
        //   id_user: user_exist[0].id_user,
        //   token: created_token,
        //   ut_datetime_created: await handler.datetime(),
        // };

        // const result = await db.insert_new(data, "user_toksens");
        return handler.returner(
            [true, { phone_number: user_id_exist[0].user_phone_number }],
            api_name,
            201
        )
        // return handler.returner(
        //   [
        //     true,
        //     {
        //       token: created_token,
        //       user_access_level: user_exist[0].id_user_access_level,
        //     },
        //   ],
        //   api_name,
        //   201
        // );
    } catch (e) {
        console.log("Error: ", e)
        return handler.returner([false, e], api_name)
    }
}
