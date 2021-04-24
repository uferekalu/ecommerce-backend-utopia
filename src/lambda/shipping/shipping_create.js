const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Shipping create"

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body)

    //error handling
    if (!body || JSON.stringify(body) === "{}") {
      throw "body is empty"
    }

    const all_fields = Object.keys(body)

    //more error handling
    const required_fields = ["id_vendor_tm", "id_order_shipping"]
    const missing_fields = required_fields.filter(field => !all_fields.includes(field))

    if (missing_fields.length > 0) {
      throw Error(missing_fields)
    }

    const { id_order_shipping, id_vendor_tm, os_tracking_number } = body
    //please note that id_vendor_tm table does not exist in the db.
    //I'm guessing what was meant in the spreadsheet was id_vendor
    //But I have carried on with what is in the worksheet.

    //check if shipping record already exist
    const shipping_record = await db.search_one(
      "order_shippings",
      "id_order_shipping",
      id_order_shipping
    )

    //if it does exist return false
    if (shipping_record.length > 0) {
      throw "Order shipping already exist"
    }

    const vendor_record = await db.search_one("vendor_tm", "id_vendor_tm", id_vendor_tm)

    const os_company = vendor_record.business_name
    //this is assuming it has a business_name atribute
    //will replace line 66 when database issue is resolved

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
    const id_order_shipping_status = insert_order_shipping_status.insertId

    const shipping_data = {
      id_order_shipping_status, //inject FK here
      os_company: "my company", //"my company" is a temporary placeholder
    }

    if (os_tracking_number) {
      shipping_data.os_tracking_number = os_tracking_number
    }

    //child
    const insert_order_shipping = await db.insert_new(shipping_data, "order_shippings")

    //The process is only successful if both tables have been successfully manipulated
    if (insert_order_shipping_status && insert_order_shipping) {
      return handler.returner([true, { ...shipping_data, ...shipping_status_data }], api_name, 201)
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
