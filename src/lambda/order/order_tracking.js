const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const api_name = "Order tracking"

exports.handler = async (event, context) => {
  try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["os_tracking_number"]

        const missing_fields = required_fields.filter(field => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const { os_tracking_number } = body

        // ensure tracking number exists
        const order_tracking_exists = await db.search_one("order_shippings", "os_tracking_number", os_tracking_number)

        //if order tracking number does not exist return error
        if (order_tracking_exists.length === 0) {
            return handler.returner([false, 
                { 
                    message: "Tracking number does not exist, please provide correct number and try again" 
                }
            ], 
            api_name, 404)
        }

        const id_order_shipping_status = order_tracking_exists[0].id_order_shipping_status
        
        const order_shipping_status_exists = await db.search_one("order_shipping_statuses", "id_order_shipping_status", id_order_shipping_status)

        if (order_shipping_status_exists === 0) {
            return handler.returner([false, 
                { 
                    message: "Order shipping status does not exist" 
                }
            ], 
            api_name, 404)
        } else {
            const oss_name = order_shipping_status_exists[0].oss_name
            return handler.returner([true, oss_name], api_name, 201)
        }



    } catch (e) {
        if (e.name === "Error") {
          const errors = e.message
            .split(",")
            .map(field => {
              return `${field} is required`
            })
            .join(", ")
          return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 400)
    }
}