const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

//------required data:id_wishlist, id_product,token
const api_name = "Wishlist insert product";
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    //1.get id_user from token
    const id_user = await db.search_get_one_column_oncondition(
      "user_tokens",
      "id_user",
      "token",
      body.token
    );
    //console.log("id_user:", id_user[0].id_user);
    //if token doesn't exist
    if (id_user.length == 0)
      return handler.returner(
        [false, { message: "User is not found/Token expired" }],
        api_name,
        404
      );
    //2.get product_title from products
    console.log("id_product:", body.id_product);
    const product_title = await db.search_get_one_column_oncondition(
      "products",
      "product_title",
      "id_product",
      body.id_product
    );
    console.log("product_title:", product_title); //[0].product_title);
    //if product id is not found
    if (product_title.length == 0)
      return handler.returner(
        [false, { message: "Product not found/Invalid product id" }],
        api_name,
        404
      );
    //3.insert product title
    //let id_wishlist = 4;
    let data = {
      id_wishlist: body.id_wishlist,
      id_user: id_user[0].id_user,
      wishlist_name: product_title[0].product_title,
      wishlist_datetime_created: await handler.datetime(),
    };

    const result = await db.insert_new(data, "wishlists");
    //id_wishlist is only PK it should be AI too
    //console.log("result:", result);
    // if token doesn't exist
    // if (result.affectedRows == 0)
    //   return handler.returner(
    //     [false, { message: "product not inserted" }],
    //     api_name,
    //     404
    //   );

    return handler.returner(
      [
        true,
        {
          message: "Product added to wishlist successfully",
        },
      ],
      api_name,
      201
    );
  } catch (e) {
    console.log("Error: ", e);
    return handler.returner([false, e.message], api_name);
  }
};
