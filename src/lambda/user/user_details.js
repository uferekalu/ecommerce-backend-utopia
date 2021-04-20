const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

const api_name = "User details";

exports.handler = async (event, context) => {
    
  try {
    const id_user = JSON.parse(event.pathParameters.id_user);
    console.log("id_user:", id_user);

    const user_exist = await db.search_one(
      "users",
      "id_user",
      id_user
    );
    
    if (user_exist.length == 0){
        return handler.returner(
          [false, { message: "User is not found" }],
          api_name,
          404
      )
    } else {
        const user_data = {
            id_user: user_exist[0].id_user,
            user_first_name: user_exist[0].user_first_name,
            user_last_name: user_exist[0].user_last_name,
            user_middle_name: user_exist[0].user_middle_name,
            user_address_shipping: user_exist[0].user_address_shipping,
            user_address_billing: user_exist[0].user_address_billing,
            user_dob: user_exist[0].user_dob,
            user_gender: user_exist[0].user_gender,
            user_email: user_exist[0].user_email,
            user_phone_number: user_exist[0].user_phone_number
        }
        return handler.returner([true, { message: "User fetched successfully", data: user_data  }], api_name, 200)
    }
    } catch(error) {
        console.log("Error: ", error);
        api_name;
        return handler.returner([false, error.toString()], api_name, 500);
    }
}
