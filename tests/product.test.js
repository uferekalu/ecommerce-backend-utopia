//Total endpoints = 7
const axios = require("axios").default

const uri = process.env.API_URI_LOCAL

describe("testing product endpoints", async () => {
  // 1
  test("should get product categories", async () => {
    const res = await axios.get(`${uri}/categories_get`)
    expect(res.status).toEqual(200)
  })

  // 2
  test("should get product details", async () => {
    const res = await axios.get(`${uri}/products_get/HP`)
    expect(res.status).toEqual(200)
  })
})
