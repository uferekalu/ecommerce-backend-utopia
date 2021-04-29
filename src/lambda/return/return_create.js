const handler = require("../../middleware/handler");
const { insert_new, search_one } = require("../../lib/database/query");

const api_name = "Return create";

exports.handler = async (event, context) => {
  try {
    const datetime = handler.datetime();
    const body = JSON.parse(event.body);

    if (!body || JSON.stringify(body) === "{}") {
      throw "body is empty";
    }

    const { items, reason, return_type, id_user } = body;

    const { id_order } = event.pathParameters;

    //check if order exists
    const order = await search_one("orders", "id_order", id_order);

    if (order.length == 0) {
      return handler.returner(
        [false, { message: "order not found" }],
        api_name,
        400
      );
    }

    //check if items belong to the order

    //save the items to be returned

    items.map(async ({ id_product, amount, quantity }) => {
      const data = {
        id_order, // the id of the order the returned items belong to. FK
        id_product, // the id of the product to be returned FK
        quantity, // the quantity of products being returned
        amount, // the total amount of products to be returned
      };
      await insert_new(data, "order_returned_items");
    });

    // calculate the total amount of items being returned

    const total_items_amount = items
      .map((item) => item.amount)
      .reduce((a, b) => a + b, 0);

    // create and save the return object
    const data = {
      return_type,
      total_items_amount,
      reason,
      id_order,
      id_user,
      created_at: datetime,
      updated_at: datetime,
    };

    const result = await insert_new(data, "returns");

    if (result) {
      return handler.returner(
        [true, { message: "the return object", data: result }],
        api_name,
        200
      );
    }
  } catch (error) {
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
