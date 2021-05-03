const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

exports.handler = async (event, context) => {
  const api_name = "Product search";
  const table = "products";
  const column = "product_title";

  try {
    const body = JSON.parse(event.body);
    const data = await db.search_one(table, column, body.product_title);

    return handler.returner([true, data], api_name);
  } catch (e) {
    console.log(e);
    return handler.returner([false, e], api_name, 500);
  }
};
