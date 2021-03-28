const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");
const token = require("../../middleware/verify_token");
const bcrypt = require("bcryptjs");
const qs = require("querystring");

const api_name = "User login";
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    //const user_exist = await db.search_one( "users","body.user_email",body.user_email)
    const id_user_access_level = 0;
    const data1 = {
      user_first_name: "nameOne",
      user_middle_name: "middileOne",
      user_last_name: "lastOne",
      user_dob: "01-01-2000",
      user_address_shipping: "addressOne",
      user_address_billing: "billingAddressOne",
      user_gender: "Male",
      user_email: "helloOne@gmail.com",
      user_password: "helloOne",
      user_datetime_created: "27-03-2021",
      id_user_status: 1,
      //id_user_access_level: 0,
      id_user_title: 1,
      email_verified: 0,
    };
    const data2 = {
      user_first_name: "nameTwo",
      user_middle_name: "middileTwo",
      user_last_name: "lastTwo",
      user_dob: "02-02-2000",
      user_address_shipping: "addressTwo",
      user_address_billing: "billingAddressTwo",
      user_gender: "Male",
      user_email: "helloTwo@gmail.com",
      user_password: "helloTwo",
      user_datetime_created: "27-03-2021",
      id_user_status: 1,
      // id_user_access_level: 0,
      id_user_title: 1,
      email_verified: 0,
    };
    const data3 = {
      user_first_name: "nameThree",
      user_middle_name: "middileThree",
      user_last_name: "lastThree",
      user_dob: "03-03-2000",
      user_address_shipping: "addressThree",
      user_address_billing: "billingAddressThree",
      user_gender: "Female",
      user_email: "helloThree@gmail.com",
      user_password: "helloThree",
      user_datetime_created: "27-03-2021",
      id_user_status: 1,
      // id_user_access_level: 0,
      id_user_title: 1,
      email_verified: 0,
    };
    //inserting 3 users manually into users table
    //const delete_all_data = await db.delete_all("users");
    const userOne = await db.insert_new(data1, "users");
    const userTwo = await db.insert_new(data2, "users");
    const userThree = await db.insert_new(data3, "users");

    console.log("const userOne", userOne);
    console.log("const userTwo", userTwo);
    console.log("const userThree", userThree);
    // const reqData = {
    //   user_email: body.user_email,
    //   user_password: body.user_password,
    // };
    const user_exist = await db.search_two(
      "users",
      "user_email",
      "user_password",
      body.user_email,
      body.user_password
    );

    if (user_exist.length == 0)
      return handler.returner(
        [false, { message: "User Email or Passworoed is not found" }],
        api_name,
        404
      );
    console.log("user_exist.length ", user_exist);
    /*const pass_valid = await bcrypt.compare(
      body.user_password,
      user_exist[0].user_password
    );
    if (!pass_valid)
      return handler.returner(
        [false, { message: "Password is invalid" }],
        api_name,
        400
      );

    if (user_exist[0].email_verified != 1)
      return handler.returner(
        [false, { message: "Account is not verified" }],
        api_name,
        400
      );*/

    const created_token = await token.create_token(user_exist[0].id_user);
    console.log("created_token:", created_token);
    let data = {
      id_user: user_exist[0].id_user,
      token: created_token,
      ut_datetime_created: await handler.datetime(),
    };

    const result = await db.insert_new(data, "user_tokens");
    console.log("user_access_level ", user_exist[0].id_user_access_level);
    console.log("user_dob ", user_exist[0].user_dob);
    return handler.returner(
      [
        true,
        {
          token: created_token,
          user_access_level:
            user_exist[0].id_user % 3 == 0
              ? [2, 3, 4, 5]
              : user_exist[0].id_user % 2 == 0
              ? [1, 3, 4, 5]
              : [0, 1, 2, 3, 4, 5], //[2, 3, 4, 5], //user_exist[0].id_user_access_level,
        },
      ],
      api_name,
      201
    );
  } catch (e) {
    console.log("Error: ", e);
    return handler.returner([false, e], api_name);
  }
};
