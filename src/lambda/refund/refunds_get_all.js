const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

const api_name = "Refund get all";

exports.handler = async (event, context) => {
  try {
    const refunds_result = await db.search_all("refunds");


    return handler.returner(
      [true, { message: "All Refunds", data: refunds_result }],
      api_name,
      200
    );
  } catch (error) {
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
