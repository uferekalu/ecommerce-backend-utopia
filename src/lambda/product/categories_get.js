const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

//---------- if categories exist send response as categories names as an array
//----------if no categories exist send message :No categories exist
const api_name = "Categories get";

exports.handler = async (event, context) => {
  try {
    let categories_list = await db.search_get_one_column(
      "product_categories",
      "category_name"
    );
    if (categories_list.length == 0)
      return handler.returner(
        [false, { message: "Sorry Categories don't exist" }],
        api_name,
        404
      );

    let category_name_list = categories_list.map((category) => {
      return category.category_name;
    });
    console.log("categories_list", category_name_list);
    return handler.returner(
      [
        true,
        {
          categories_list: category_name_list,
        },
      ],
      api_name,
      200
    );
  } catch (e) {
    console.log("error", e);
    return handler.returner([false, e], api_name, 500);
  }
};
