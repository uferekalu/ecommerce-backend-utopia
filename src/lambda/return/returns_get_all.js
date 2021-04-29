const handler = require("../../middleware/handler");
const { search_all, join_two_tables } = require("../../lib/database/query");

const api_name = "Return get all";

exports.handler = async (event, context) => {
  try {
    const all_returns_result = await search_all("returns");

    // get all the return items
    const returned_items_results = await join_two_tables(
      "order_returned_items",
      "products",
      "id_product",
      [
        "product_desc",
        "product_title",
        "amount",
        "quantity",
        "id_order",
        "products.id_product",
      ]
    );

    //get all return items for each returns
    const all_returns = all_returns_result.map((return_result) => {
      const returned_items = returned_items_results.filter(
        (returned_item) => returned_item.id_order === return_result.id_order
      );
      return { ...return_result, returned_items };
    });

    return handler.returner(
      [true, { message: "All Returns", data: all_returns }],
      api_name,
      200
    );
  } catch (error) {
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
