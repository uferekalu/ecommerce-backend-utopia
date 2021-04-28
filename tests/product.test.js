//Total endpoints = 6
const axios = require("axios").default

const {
  productTwo,
  getProductId,
  getProductVendorId,
  deleteProductRecord,
  productOne,
} = require("./fixtures/db")
const { utils } = require("./fixtures/utils")

const uri = process.env.API_URI_LOCAL

describe("testing product endpoints", async () => {
  afterAll(async () => {
    const target = await getProductId()
    deleteProductRecord(target)
  })

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

  // 3
  test("should get product", async () => {
    const res = await axios.get(`${uri}/products_get/${productOne.id_product}`)
    expect(res.status).toEqual(200)
  })

  // 4
  test("should create new product", async () => {
    const res = await axios.post(`${uri}/product-create`, productTwo)
    expect(res.status).toEqual(201)
  })

  //5
  test("should get product details", async () => {
    const target_id = await getProductId()
    const res = await axios.get(`${uri}/product_details_get/${target_id}`)
    expect(res.status).toEqual(200)
  })

  //6
  test("should create product review", async () => {
    const target_id = await getProductId()
    const id_product_m2m_vendor = await getProductVendorId(target_id)
    const res = await axios.get(`${uri}/product_review_create`, {
      id_product_m2m_vendor,
      product_review: utils.review,
      token: utils.token,
    })
    expect(res.status).toEqual(201)
  })
})
