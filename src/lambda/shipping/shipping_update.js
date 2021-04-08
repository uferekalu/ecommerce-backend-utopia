const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Shipping update"

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body)

  try {
    for (let prop in body) {
      if (prop) {
        const shipping_record = await db.search_one("order_shippings", `${prop}`, body[prop])
        return handler.returner([true, {}], api_name, 200)
      }
    }

    return handler.returner([true, {}], api_name, 200)
  } catch (e) {
    console.log(e)
    return handler.returner([false, e], api_name, 400)
  }
}
