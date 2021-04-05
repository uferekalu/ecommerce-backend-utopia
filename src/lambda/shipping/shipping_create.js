const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Shipping create"

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body)
  const { id_order_shipping, id_vendor_tm, os_tracking_number } = body

  try {
    //check if shipping record already exist
    const shipping_record = await db.search_one(
      "order_shippings",
      "id_order_shipping",
      id_order_shipping
    )

    //if it does exist return false
    if (shipping_record.length > 0) {
      return handler.returner([false, { message: "Order shipping is in progress" }], api_name, 400)
    }

    const datetime = handler.datetime()

    const shipping_status_data = {
      oss_name: "in progress",
      oss_datetime_change: datetime,
    }

    //parent
    const insert_order_shipping_status = await db.insert_new(
      shipping_status_data,
      "order_shipping_statuses"
    )

    //grab PK from parent
    const { id_order_shipping_status } = insert_order_shipping_status

    const shipping_data = {
      id_order_shipping_status, //inject FK here
      os_company: "my company",
      os_tracking_number: "1234", //how can this be generated??
    }

    //child
    const insert_order_shipping = await db.insert_new(shipping_data, "order_shippings")

    if (insert_order_shipping_status && insert_order_shipping) {
      return handler.returner([true, {}], api_name, 201)
    }
  } catch (e) {
    return handler.returner([false, e], api_name, 400)
  }
}
