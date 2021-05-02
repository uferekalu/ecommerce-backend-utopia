const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");
const send = require("../../lib/services/email/send_email");
const bcrypt = require("bcryptjs");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");

const passwordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
};

const api_name = "User create";
const email_info = {
  subject: "Email Verification",
  message: "Please click here to verify your email\n\n\n\n",
}; // we can send  HTML template insted of messgae

exports.handler = async (event, context) => {
  try {
    var datetime = await handler.datetime();
    const body = JSON.parse(event.body);
    const password_hashed = await passwordHash(body.user_password);

    const data = {
      user_first_name: body.user_first_name,
      user_middle_name: body.user_middle_name,
      user_last_name: body.user_last_name,
      user_dob: body.user_dob,
      user_address_shipping: body.user_address_shipping,
      user_address_billing: body.user_address_billing,
      user_gender: body.user_gender,
      user_email: body.user_email,
      user_password: password_hashed,
      user_datetime_created: datetime,
      id_user_status: 1,
      id_user_access_level: 0,
      id_user_title: 1,
      email_verified: 0,
    };

    const email_exist = await db.search_one(
      "users",
      "user_email",
      body.user_email
    );

    if (email_exist.length != 0) {
      console.log("Email Already Exists");
      return handler.returner(
        [false, { message: "Email already Exists" }],
        api_name,
        400
      );
    }

    const result = await db.insert_new(data, "users");

    const id_hashed = cryptr.encrypt(result.insertId);
    email_info.message += `https://4l0nq44u0k.execute-api.us-east-2.amazonaws.com/staging/api/user_email_verify/${id_hashed}`;

    await send.send_email(body.user_email, email_info);

    return handler.returner(
      [
        true,
        { message: "Created account successful", id_user: result.insertId },
      ],
      api_name,
      201
    );
  } catch (e) {
    console.log("Error: ", e);
    return handler.returner([false, e.toString()], api_name, 500);
  }
};
