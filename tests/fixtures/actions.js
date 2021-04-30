const db = require("../../src/lib/database/query")

async function createUser(data) {
  await db.insert_new(data, "users")
}

async function deleteUser(data) {
  await db.delete_one("users", "user_first_name", data.user_first_name)
}

async function getUserId(data) {
  const result = await db.search_one("users", "user_first_name", data.user_first_name)
  return result.insertId
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
  resetOrderStatus,
  getProductId,
  getProductVendorId,
  deleteProductRecord,
  getVendorId,
  deleteVendorRecord,
  deleteOrderRecord,
}
