//Total endpoints = 2
const axios = require("axios").default

const { userOne, orderOne } = require("./fixtures/data")

const uri = process.env.API_URI_LOCAL

describe("testing order endpoints", () => {
  afterAll(() => resetOrderStatus())
  1
  test("should create order", async () => {
    const res = await axios.post(`${uri}/order_create`, {
      id_user: userOne.id_user,
      id_product_m2m_vendor: [1, 2, 3],
    })
    expect(res.status).toEqual(201)
  })

  // 2
  test("should update order", async () => {
    const res = await axios.post(`${uri}/order_update`, {
      id_user: userOne.id_user,
      id_order: orderOne.id_order,
      id_order_status: 2,
    })
    expect(res.status).toEqual(200)
  })
})
