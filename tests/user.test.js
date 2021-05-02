//Total endpoints = 12
const axios = require("axios").default

const { deleteUser, getUserId } = require("./fixtures/database")
const { userOne, userTwo } = require("./fixtures/data")
const uri = process.env.API_URI_LOCAL

describe("tests user endpoints", async () => {
  afterAll(() => deleteUser())

  // 1
  test("should create new user", async () => {
    const res = await axios.post(`${uri}/user_create`, userTwo)
    expect(res.status).toEqual(201)
  })

  // 2
  test("should logout user", async () => {
    const res = await axios.post(`${uri}/user_logout`)
    expect(res.status).toEqual(201)
  })

  // 3
  test("should login user", async () => {
    const res = await axios.post(`${uri}/user_login`, {
      user_email: userOne.user_email,
      user_password: userOne.user_password,
    })
    expect(res.status).toEqual(201)
  })

  // 4
  test("should verify user email", async () => {
    const res = await axios.post(`${uri}/user_email_verify/${getUserId()}`)
    expect(res.status).toEqual(200)
  })

  // 5
  test("should get user access level", async () => {
    const res = await axios.post(`${uri}/user_access_level_get`, {
      user_email: "mejabidurotimi@gmail.com",
    })
    expect(res.status).toEqual(200)
  })

  // 6
  test("should get user details", async () => {
    const res = await axios.get(`${uri}/user_details`)
    expect(res.status).toEqual(200)
  })

  // 7
  test("should get user full name", async () => {
    const res = await axios.get(`${uri}/user-first-last-get-all`)
    expect(res.status).toEqual(200)
  })
  // 8
  test("should update user", async () => {
    const res = await axios.post(`${uri}/user_update`)
    expect(res.status).toEqual(200)
  })
})
