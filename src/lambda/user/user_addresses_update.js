const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

//-----required data user_address_billing, user_address_shipping, user_id
//---------- check if incoming user id exists, if so get the address and send it as response
const api_name = "User addresses update";
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    console.log("shippingAddress", body.user_address_shipping);
    console.log("billingAddress", body.user_address_billing);
    console.log("user_id:", body.user_id);
    const user_exist = await db.search_one(
      "users",
      "id_user",

      body.user_id
    );
    //console.log("user exist:", user_exist);
    if (user_exist.length == 0)
      return handler.returner(
        [
          false,
          {
            message: `User with ID:${body.user_id} doesn't exist, can't update the addresses`,
          },
        ],
        api_name,
        404
      );

    const updateData = {
      user_address_shipping: body.user_address_shipping,
      user_address_billing: body.user_address_billing,
    };
    const didAddressesUpdate = await db.update_one(
      "users",
      updateData,
      "id_user",
      body.user_id
    );
    console.log("didAddressesUpdate::", didAddressesUpdate.affectedRows);
    // let wishlist_name_list = whish_list.map((item) => {
    //   return item.wishlist_name;
    // });
    if (didAddressesUpdate.affectedRows == 0) {
      return handler.returner([
        false,
        { message: "Something went wrong, couldn't update user addresses" },
      ]);
    }
    return handler.returner(
      [
        true,
        {
          message: "Billing address and Shipping address have been updated",
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
