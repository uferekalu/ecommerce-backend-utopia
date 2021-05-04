const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");
const connection = require("../../lib/database/connect");
//required data got order_update is id_user,id_or der,id_order_status
//------search if orderexist with the given id_order and id_user
//------if order exists update id_order_status
const api_name = "Order update";
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const order_exist = await db.search_two(
      "orders",
      "id_order",
      "id_user",
      body.id_order,
      body.id_user
    );

    console.log("body.id_order", body.id_order);
    if (order_exist.length == 0)
      return handler.returner(
        [false, { message: "Order is not found" }],
        api_name,
        404
      );

    // update_one: async (table, updated_data, column, condition) => {
    //   const result = await connection.query(
    //     `UPDATE ${table} SET ? WHERE ${column} = ?`,
    //     [updated_data, condition]
    //   );
    //   return result;
    // };
    // const update = await connection.query(`UPDATE orders SET id_order_status=${body.id_iser_status} where id_order=${body_id_order}`);
    //     UPDATE Customers
    // SET ContactName = 'Alfred Schmidt', City= 'Frankfurt'
    // WHERE CustomerID = 1;
    //-----to update a order status it has to be existed in the parent table i.e, order_statuses
    const order_status_exist = await db.search_one(
      "order_statuses",
      "id_order_status",
      body.id_order_status
    );
    //if (order_status_exist !== 0)
    if (order_status_exist == 0)
      return handler.returner(
        [false, { message: "Order status is not found" }],
        api_name,
        404
      );
    const updated_data = {
      // id_user: body.id_user,
      id_order_status: body.id_order_status,
    };

    const update = await db.update_one(
      "orders",
      updated_data,
      "id_order",

      body.id_order
    );
    return handler.returner(
      [true, { message: "Order is updated" }],
      api_name,
      200
    );
  } catch (e) {
    console.log("Error: ", e);
    return handler.returner([false, e], api_name);
  }
};
