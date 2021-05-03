const db = require("../../src/lib/database/query")
const { userTwo } = require("./data")

async function createUser(data) {
  await db.insert_new(data, "users")
}

async function deleteUser() {
  const data = await db.search_one("users", "user_first_name", userTwo.user_first_name)
  const user_id = data[0].id_user
  await db.delete_one("user_tokens", "id_user", user_id)
  await db.delete_one("users", "id_user", user_id)
}

async function getUserId(data) {
  const result = await db.search_one("users", "user_first_name", data)
  return result[0].id_user
}

async function getUserToken(data) {
  const res = await db.search_one("users", "user_first_name", data)
  const result = await db.search_one("user_tokens", "id_user", res[0].id_user)
  return result[0].token
}

async function resetOrderStatus(id_order_status, id_order) {
  await db.update_one("orders", id_order_status, "id_order", id_order)
}

async function deleteOrderRecord(id_order) {
  await db.delete_one("orders", "id_order", id_order)
  await db.delete_one("orders_m2m_products", "id_order", id_order)
}

async function getProductId(data) {
  const result = await db.search_one("products", "product_title", data.product_title)
  return result[0].id_product
}

async function getProductVendorId(data) {
  const result = await db.search_one("products_m2m_vendors", "id_product", data)
  return result[0].id_product
}

async function getVendorId(data) {
  const result = await db.search_one("vendors", "business_name", data.business_name)
  return result.insertId
}

async function deleteProductRecord(data) {
  try {
    await db.delete_one("products_m2m_vendors", "id_product", data)
    await db.delete_one("products", "id_product", data)
  } catch (err) {
    console.log(err)
  }
}
async function deleteVendorRecord(data) {
  try {
    await db.delete_one("vendors", "id_vendor", data)
    await db.delete_one("vendor_tokens", "id_vendor", data)
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  createUser,
  deleteUser,
  getUserId,
  getUserToken,
  resetOrderStatus,
  getProductId,
  getProductVendorId,
  deleteProductRecord,
  getVendorId,
  deleteVendorRecord,
  deleteOrderRecord,
}
