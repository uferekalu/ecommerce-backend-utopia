const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

//-----required data user_id,token
//---------- check if id_user and token existed together in token table ,if so check with the
//------wishlist table  for id_suer and send response as wishlist name,if not send false message
const api_name = "Whishlist get all";
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const user_exist = await db.search_two(
      "user_tokens",
      "token",
      "id_user",
      body.token,
      body.id_user
    );
    console.log("user exist:", user_exist);
    if (user_exist.length == 0)
      return handler.returner(
        [false, { message: "Token is expired/ Wrong user id with the token" }],
        api_name,
        404
      );

    const whish_list = await db.search_one(
      "wishlists",
      "id_user",
      body.id_user
    );
    console.log("whish_list", whish_list);
    let wishlist_name_list = whish_list.map((item) => {
      return item.wishlist_name;
    });

    return handler.returner(
      [
        true,
        {
          wish_list: wishlist_name_list,
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
