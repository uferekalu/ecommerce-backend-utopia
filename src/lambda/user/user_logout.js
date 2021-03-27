const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");
const token = require("../../middleware/verify_token");
const bcrypt = require("bcryptjs");
const qs = require("querystring");
const { delete_one } = require("../../lib/database/query");
//
const api_name = "User logout";
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);

    const token_exist = await db.search_one("user_tokens", "token", body.token);
    //*******if the token don't exist sendback false, { message: "User is not found" }
    //*******if exists delete it from the user_tokens table send a success bool back
    console.log("token_existin logout", token_exist);
    console.log("token_exist.length logout", token_exist.length);
    if (token_exist.length == 0)
      return handler.returner(
        [false, { message: "User is not found" }],
        api_name,
        404
      );
    //if (token_exist) {
    const deletedToken = await delete_one("user_tokens", "token", body.token);
    return handler.returner([true], api_name, 201);
    //}
  } catch (e) {
    console.log("Error: ", e);
    return handler.returner([false, e], api_name);
  }
};
