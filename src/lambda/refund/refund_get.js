const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

const api_name = "Refund get one";

exports.handler = async (event, context) => {
  try {
    const { id_refund } = event.pathParameters;

    const refund_result = await db.search_one("refunds", "id_refund", id_refund);

    if (refund_result.length === 0) {
      return handler.returner(
        [false, { message: "refund not found" }],
        api_name,
        400
      );
    }

    return handler.returner(
      [true, { message: "Refund By ID", data: refund_result[0] }],
      api_name,
      200
    );
  } catch (error) {
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
