const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

const api_name = "Refund create";

exports.handler = async (event, context) => {
  try {
    const datetime = handler.datetime();
    const body = JSON.parse(event.body);

    if (!body || JSON.stringify(body) === "{}") {
      throw "body is empty";
    }

    const {
      payment_method,
      payment_id, //id of payment to be refunded
      amount,
      id_user,
      currency,
    } = body;

    const { id_order, id_return } = event.pathParameters;

    const return_result = await db.search_two(
      "returns",
      "id_return",
      "return_type",
      id_return,
      "Refund"
    );

    if (return_result.length === 0) {
      return handler.returner(
        [false, { message: "return not found" }],
        api_name,
        400
      );
    }

    if (return_result[0].refund_status === "completed") {
      return handler.returner(
        [false, { message: "refund has already being completed" }],
        api_name,
        400
      );
    }

    // make request to bank or {payment_method} for refund;

    //if refund is successful, update return with data from refund.

    return_result[0].refund_status = "completed",
    return_result[0].refund_result_id = 61

    await db.update_one(
      "returns",
      return_result[0],
      "id_return",
      id_return
    );

    // save refund details.

    const data = {
      id_order,
      refund_status: "completed", //refund status from payment_method
      payment_id,
      refund_result_id: 1, //refund id from payment_method
      payment_method,
      amount,
      id_user,
      id_return,
      currency,
      created_at: datetime,
      updated_at: datetime,
    };

    const result = await db.insert_new(data, "refunds");

    if (result) {
      return handler.returner(
        [true, { message: "Refund Successfully Completed!", data: result }],
        api_name,
        200
      );
    }
  } catch (error) {
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
