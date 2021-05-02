//Total endpoints = 2
//id_product_m2m_vendor is the required for this test.
const axios = require("axios").default

const { userOne, orderOne, utils } = require("./fixtures/data")
const { deleteOrderRecord, resetOrderStatus } = require("./fixtures/actions")

const uri = process.env.API_URI_LOCAL

describe("testing order endpoints", () => {
  let order_id

  afterAll(async () => {
    await deleteOrderRecord(order_id)
  })

  // 1
  test("should create order", async () => {
    const res = await axios.post(`${uri}/order_create`, {
      id_user: userOne.id_user,
      id_product_m2m_vendor: [65],
      total: utils.total,
      paymentMethod: utils.payMethod,
    })
    order_id = res.data.data.id_order
    expect(res.status).toEqual(201)
  }, 10000)

  // 2
  test("should update order", async () => {
    const res = await axios.put(`${uri}/order_update`, {
      id_user: userOne.id_user,
      id_order: order_id,
      id_order_status: 2,
    })
    expect(res.status).toEqual(200)
    resetOrderStatus({ id_order_status: 1 }, order_id)
  })

  // 3
  test("should track order", async () => {
    const res = await axios.post(`${uri}/order_tracking`, {
      os_tracking_number: "kdkdjdhdhdjsks",
    })
    expect(res.status).toEqual(201)
  })
})
