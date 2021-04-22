const axios = require("axios").default

const { userOne, userTwo } = require("./fixtures/db")
const uri = process.env.API_URI

test("should login user", async () => {
  const res = await axios.post(`${uri}/user_login`, {
    user_email: userOne.user_email,
    user_password: userOne.user_password,
  })
  expect(res.status).toEqual(201)
})

test("should logout user", async () => {
  const res = await axios.post(`${uri}/user_logout`)
  expect(res.status).toEqual(200)
})

test("should create new user", async () => {
  const res = await axios.post(`${uri}/user_create`, {
    user_first_name: userTwo.user_first_name,
    user_last_name: userTwo.user_last_name,
    user_email: userTwo.user_email,
    user_password: userTwo.user_password,
    id_user_access_level: userTwo.id_user_access_level,
    id_user_title: userTwo.id_user_title,
  })
  expect(res.status).toEqual(201)
})

test("should verify user email", async () => {
  const res = await axios.post(`${uri}/user_email_verify/${userOne.id_user}`)
  expect(res.status).toEqual(200)
})

test("should get username", async () => {
  const res = await axios.post(`${uri}/user-first-last-get-all`)
  expect(res.status).toEqual(200)
})

test("should get user access level", async () => {
  const res = await axios.post(`${uri}/user_access_level_get`)
  expect(res.status).toEqual(200)
})
