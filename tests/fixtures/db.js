const handler = require("../../src/middleware/handler")
const db = require("../../src/lib/database/query")

//UserOne already in the database
const userOne = {
  id_user: 15,
  user_first_name: "john",
  user_middle_name: "middleOne",
  user_last_name: "smith",
  user_email: "john@gmail.com",
  user_address_shipping: "addressOne",
  user_address_billing: "billingAddressOne",
  user_password: "john",
  id_user_access_level: 0,
  id_user_title: 1,
}

const orderOne = {
  id_order_status: 1,
}

const userTwo = {
  user_first_name: "jakata",
  user_middle_name: "john",
  user_last_name: "paul",
  user_dob: "200",
  user_address_shipping: "back street",
  user_address_billing: "up town",
  user_gender: "male",
  user_email: "jakata@paul.com",
  user_password: "pass123",
  user_datetime_created: handler.datetime(),
  id_user_status: 1,
  id_user_access_level: 0,
  id_user_title: 1,
  email_verified: 0,
}

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

async function resetOrderStatus() {
  await db.update_one("orders", orderOne.id_order_status, "id_order", userOne.id_user)
}

module.exports = {
  userOne,
  userTwo,
  orderOne,
  createUser,
  deleteUser,
  getUserId,
  resetOrderStatus,
}
