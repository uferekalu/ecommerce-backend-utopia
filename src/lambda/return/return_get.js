const handler = require("../../middleware/handler");
const {search_one, join_two_tables_and_search_one } = require("../../lib/database/query");

const api_name = "Returns get all";

exports.handler = async (event, context) => {
  try {
    const { id_return } = event.pathParameters;

    // check if return object exists
    const return_result = await search_one(
      "returns",
      "id_return",
      id_return
    );

    if (return_result.length === 0) {
      return handler.returner(
        [false, { message: "return not found" }],
        api_name,
        400
      );
    }

    // get the returned items for this return
    const returned_items_result = await join_two_tables_and_search_one(
      "order_returned_items",
      "products",
      "id_product",
      ["product_desc, product_title, amount, quantity, id_order, products.id_product"],
      "id_order",
      return_result[0].id_order
    );

    return handler.returner(
      [
        true,
        {
          message: "Return By ID",
          data: {
            ...return_result[0],
            returned_items: [...returned_items_result],
          },
        },
      ],
      api_name,
      200
    );
  } catch (error) {
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
