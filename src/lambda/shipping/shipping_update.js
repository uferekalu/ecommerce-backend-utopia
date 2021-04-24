const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Shipping update"

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body)

    if (body && JSON.stringify(body) !== "{}") {
      const optional_fields = Object.keys(body)

      if (optional_fields.includes("id_order_shipping_status")) {
        const { id_order_shipping_status } = body
        const shipping_status_record = await db.search_one(
          "order_shippings",
          "id_order_shipping_status",
          id_order_shipping_status
        )

        if (!shipping_status_record.length > 0) {
          throw "there is no shipping update. Will you like to create shipping?"
        }

        const shipping_record = await db.search_one(
          "order_shipping_statuses",
          "id_order_shipping_status",
          id_order_shipping_status
        )

        delete shipping_record[0].oss_datetime_change

        return handler.returner(
          [true, { ...shipping_status_record[0], ...shipping_record[0] }],
          api_name,
          200
        )
      }
    }

    const shipping_update = await db.join_two_tables(
      "order_shipping_statuses",
      "order_shippings",
      "id_order_shipping_status",
      [
        "order_shipping_statuses.id_order_shipping_status",
        "id_order_shipping",
        "os_tracking_number",
        "os_company",
        "oss_name",
      ]
    )

    return handler.returner([true, shipping_update], api_name, 200)
  } catch (e) {
    return handler.returner([false, e], api_name, 400)
  }
}
