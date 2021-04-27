//Total tests = 3
const axios = require("axios").default

const { getVendorId, deleteVendorRecord, vendorTwo } = require("./fixtures/db")

const uri = process.env.API_URI_LOCAL

describe("testing vendor endpoints", async () => {
  afterAll(async () => {
    const target = await getVendorId()
    deleteVendorRecord(target)
  })

  // 1
  test("should create new vendor", async () => {
    const res = await axios.post(`${uri}/vendor_create`, vendorTwo)
    expect(res.status).toEqual(201)
  })
})
