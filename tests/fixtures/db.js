const Cryptr = require("cryptr")
const cryptr = new Cryptr("myTotalySecretKey")

const userOne = {
  id_user: cryptr.encrypt(17),
  user_first_name: "raj",
  user_last_name: "raj",
  user_email: "raj@hotmail.com",
  user_password: "raj",
  id_user_access_level: 0,
  id_user_title: 1,
}
const userTwo = {
  user_first_name: "ugo",
  user_last_name: "ugo",
  user_email: "ugo@hotmail.com",
  user_password: "ugo",
  id_user_access_level: 0,
  id_user_title: 1,
}

module.exports = {
  userOne,
  userTwo,
}
