const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const api_name = "Order create"

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
    const required_fields = ["id_user", "id_product_m2m_vendor", "paymentMethod", "total"]

    const missing_fields = required_fields.filter(field => !all_fields.includes(field))

    if (missing_fields.length > 0) {
      throw Error(missing_fields)
    }

    const { id_user, id_product_m2m_vendor } = body

    // ensure user exists
    const user_exist = await db.search_one("users", "id_user", id_user)

    //if user does not exist return error
    if (user_exist.length === 0) {
      throw "user not found"
    }

    //converts id_product_m2m_vendor to multidimensional array
    const multi_id = id_product_m2m_vendor.map(_id => [_id])

    const new_order_m2m_product = await db.insert_many(
      multi_id,
      ["id_product_m2m_vendor"],
      "orders_m2m_products"
    )

    if (!new_order_m2m_product) {
      throw "product not successfully ordered"
    }

    //copying body object then delete the id_product_m2m_vendor prop
    const data = body
    delete data.id_product_m2m_vendor

    //destructing the props from mysql insert
    //affectedRows > 1 means multiple rows records inserted
    //insertedId is the id of the first row inserted
    const { affectedRows, insertId } = new_order_m2m_product
    let values = []
    for (let i = 0; i < affectedRows; i++) {
      let base = Object.values(data)
      base.push(i + insertId)
      values.push(base)
    }
    const columns = Object.keys(data)

    columns.push("id_order_m2m_product")

    const orders = await db.insert_many(values, columns, "orders")

    if (orders.length === affectedRows) {
      throw "orders not successfully created"
    }

    let order_list = []
    let order_m2m_product_list = []

    for (let i = 0; i < affectedRows; i++) {
      order_list.push(i + orders.insertId)
      order_m2m_product_list.push(i + new_order_m2m_product.insertId)
    }

    data.id_order_m2m_product = order_m2m_product_list.join(", ")
    data.id_order = order_list.join(", ")

    return handler.returner([true, data], api_name, 201)
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
