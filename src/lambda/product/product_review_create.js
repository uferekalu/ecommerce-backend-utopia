const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const token = require("../../middleware/verify_token")
const api_name = "Product review create"

exports.handler = async (event, context) => {
  try {
    var datetime = await handler.datetime()
    const body = JSON.parse(event.body)
    const { id_user, id_product_m2m_vendor, product_review, token } = body
    // retrieve the token(s) from the user_tokens table.
    // could return an array of more than one token
    const validate_user_token = await db.search_one("user_tokens", "id_user", id_user)
    // if the array is empty return an error
    if (validate_user_token.length === 0) {
      return handler.returner([false, { message: "User is not found" }], api_name, 404)
    }
    // every token must be deleted after use but in case multiple tokens were returned
    // filter out the one you need
    const valid_reviewer = validate_user_token.filter(user => user.token === token)
    // by now we should have what we searching for,
    // if not then the user is not eligible to review the product so return error
    if (valid_reviewer.length === 0) {
      return handler.returner([false, { message: "You are not eligible to review the product" }], api_name, 404)
    }
    // ensure product exist
    const product_m2m_vendor_exist = await db.search_one(
      "products_m2m_vendors",
      "id_product_m2m_vendor",
      id_product_m2m_vendor
    )
    //if product does not exist return error
    if (product_m2m_vendor_exist.length === 0) {
      return handler.returner(
        [false, { message: "Product is not found for review" }],
        api_name,
        404
      )
    }
    // extract order_m2m_product record using the condition id_product_m2m_vendor
    const order_m2m_product = await db.search_one(
      "orders_m2m_products",
      "id_product_m2m_vendor",
      id_product_m2m_vendor
    )
    //if product order record doesnt exist return error
    if (order_m2m_product.length === 0) {
      return handler.returner([false, { message: "message here" }], api_name, 404)
    }
    // retrieve the id_order_m2m_product
    const { id_order_m2m_product } = order_m2m_product[0]
    const data = { product_review, id_order_m2m_product }
    const result = await db.insert_new(data, "product_reviews")
    if (result) {
      return handler.returner([true, data], api_name, 201)
    }
  } catch (e) {
    console.log("Error: ", e)
    return handler.returner([false, e.toString()], api_name, 500)
  }
}