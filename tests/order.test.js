const axios = require("axios").default

const { userOne, userTwo } = require("./fixtures/db")

const uri = process.env.API_URI_LOCAL

describe("testing order endpoints", () => {
  test("should create order", async () => {
    const res = await axios.post(`${uri}/order_create`, {
      id_user: userOne.id_user,
      id_product_m2m_vendor: [1, 2, 3],
    })
    expect(res.status).toEqual(201)
  })
})
