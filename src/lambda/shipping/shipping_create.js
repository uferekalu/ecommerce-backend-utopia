const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Shipping create"

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body)
  const { id_vendor_tm, id_order_shipping } = body
  try {
    return handler.returner([true, {}], api_name, 201)
  } catch {
    console.log(e)
    return handler.returner([false, e], api_name, 400)
  }
}
