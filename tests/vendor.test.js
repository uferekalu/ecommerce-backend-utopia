const axios = require("axios").default

const uri = process.env.API_URI_LOCAL

describe("testing vendor endpoints", async () => {
  test("should create new vendor", async () => {
    const res = await axios.post(`${uri}/vendor_create`)
    expect(res.status).toEqual(201)
  })
})
