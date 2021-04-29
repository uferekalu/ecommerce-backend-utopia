const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");

const api_name = "Order create";

exports.handler = async (event, context) => {
  try {
    var datetime = await handler.datetime();
    const body = JSON.parse(event.body);

    const {
      id_user,
      id_product_m2m_vendor,
      id_order_status,
      total,
      paymentMethod,
    } = body;

    // const id_user = event.queryStringParameters.id_user;
    // const id_product_m2m_vendor = event.queryStringParameters.id_product_m2m_vendor;
    // const id_order_status = event.queryStringParameters.id_order_status;

    let user_result = await db.search_one("users", "id_user", id_user);
    let product_m2m_vendor_result = await db.search_one(
      "products_m2m_vendors",
      "id_product_m2m_vendor",
      id_product_m2m_vendor
    );
    let order_status_result = await db.search_one(
      "order_statuses",
      "id_order_status",
      id_order_status
    );

    if (user_result.length == 0) {
      console.log("User is not found!");
      return handler.returner(
        [false, { message: "User is not found" }],
        api_name,
        400
      );
    }

    if (product_m2m_vendor_result.length == 0) {
      console.log("You must have a product or products to create an order!");
      return handler.returner(
        [
          false,
          {
            message: "You must have a product or products to create an order!",
          },
        ],
        api_name,
        400
      );
    }
    if (order_status_result.length == 0) {
      console.log("Please provide order status");
      return handler.returner(
        [false, { message: "Please provide order status" }],
        api_name,
        400
      );
    }

    const data = {
      id_order_status,
      id_orders_m2m_products: id_product_m2m_vendor,
      id_user: id_user,
      total: total,
      created_at: datetime,
      paymentMethod: paymentMethod,
      isPaid: 0,
    };

    const result = await db.insert_new(data, "orders");
    if (result) {
      return handler.returner(
        [true, { message: "Order created successfully", data: data }],
        api_name,
        201
      );
    }
  } catch (error) {
    console.log("Error: ", error);
    return handler.returner([false, error.toString()], api_name, 500);
  }
};
