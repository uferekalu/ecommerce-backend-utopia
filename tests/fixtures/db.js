const handler = require("../../src/middleware/handler")
const db = require("../../src/lib/database/query")
/*
key: 
  -One: seeding and setup
  -Two: Operational
*/

const userOne = {
  id_user: 146,
  user_first_name: "gbenga",
  user_last_name: "omowole",
  user_email: "omo@mail.com",
  user_password: "pass123",
  id_user_access_level: 0,
  id_user_title: 1,
}

const orderOne = {
  id_order: 8,
  id_order_status: 1,
}

const userTwo = {
  user_first_name: "jakata",
  user_last_name: "paul",
  user_password: "pass123456789",
  user_dob: "2000",
  user_gender: "male",
  id_user_status: 1,
  user_email: "jakata@mail.com",
  id_user_title: 1,
}

const productOne = {
  id_product: 3,
  id_category: 2,
  product_title: "HP",
  product_desc: "HP",
  id_product_thumbnail: 2,
}

const productTwo = {
  p2v_price: 105,
  id_category: 1,
  id_vendor: 3,
  product_title: "test product xyz",
  product_desc: "the best product in the world",
  thumbnail: {
    name: "image",
    title: "product image",
  },
}

const vendorTwo = {
  id_vendor_status: 1,
  business_name: "test vendor",
  vendor_phone_number: 1230456,
  vendor_address: "australia",
  vendor_short_desc: "leaders of online services",
}

// ********
async function setupDB() {
  //user
  //user token
  //vendor
  //product_categories
  //product
  //order
  //order_shipping_status
  //order_shipping
}

// users------------------------------------------------
async function createUser() {
  await db.insert_new(userTwo, "users")
}

async function deleteUser() {
  await db.delete_one("users", "user_first_name", userTwo.user_first_name)
}

async function getUserId() {
  const result = await db.search_one("users", "user_first_name", userTwo.user_first_name)
  return result.insertId
}

//orders--------------------------------------
async function resetOrderStatus() {
  await db.update_one("orders", orderOne.id_order_status, "id_order", orderOne.id_order)
}

async function getProductId() {
  const result = await db.search_one("products", "product_title", productTwo.product_title)
  return result[0].id_product
}

async function getProductVendorId(target) {
  const result = await db.search_one("products_m2m_vendors", "id_product", target)
  return result[0].id_product
}

async function getVendorId() {
  const result = await db.search_one("vendors", "business_name", vendorTwo.business_name)
  return result.insertId
}

async function deleteProductRecord(target) {
  try {
    await db.delete_one("products_m2m_vendors", "id_product", target)
    await db.delete_one("products", "id_product", target)
  } catch (err) {
    console.log(err)
  }
}
async function deleteVendorRecord(target) {
  try {
    await db.delete_one("vendors", "id_vendor", target)
    await db.delete_one("vendor_tokens", "id_vendor", target)
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  userOne,
  userTwo,
  orderOne,
  productOne,
  productTwo,
  vendorTwo,
  createUser,
  deleteUser,
  getUserId,
  resetOrderStatus,
  getProductId,
  getProductVendorId,
  deleteProductRecord,
  getVendorId,
  deleteVendorRecord,
}
