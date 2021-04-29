//Total endpoints = 6
const axios = require("axios").default

const { productTwo, utils } = require("./fixtures/data")

const { getProductId, getProductVendorId, deleteProductRecord } = require("./fixtures/actions")

const uri = process.env.API_URI_LOCAL

describe("testing product endpoints", async () => {
  //1
  test("should search product", async () => {
    const res = await axios.get(`${uri}/product_search`)
    expect(res.status).toEqual(200)
  })

  // 2
  test("should get product categories", async () => {
    const res = await axios.get(`${uri}/categories_get`)
    expect(res.status).toEqual(200)
  })

  describe("should manipulate product", async () => {
    afterAll(async () => {
      const target = await getProductId(productTwo)
      deleteProductRecord(target)
    })
    // 3
    test("should create new product", async () => {
      const res = await axios.post(`${uri}/product-create`, productTwo)
      expect(res.status).toEqual(201)
    })

    // 4
    test("should get product", async () => {
      const target_id = await getProductId(productTwo)
      const res = await axios.get(`${uri}/products_get/${target_id}`)
      expect(res.status).toEqual(200)
    })

    //5
    test("should get product details", async () => {
      const target_id = await getProductId(productTwo)
      const res = await axios.get(`${uri}/product_details_get/${target_id}`)
      expect(res.status).toEqual(201)
    })

    //6
    test("should create product review", async () => {
      const target_id = await getProductId(productTwo)
      const id_product_m2m_vendor = await getProductVendorId(target_id)
      const res = await axios.get(`${uri}/product_review_create`, {
        id_product_m2m_vendor,
        product_review: utils.review,
        token: utils.token,
      })
      expect(res.status).toEqual(201)
    })
  })
})
