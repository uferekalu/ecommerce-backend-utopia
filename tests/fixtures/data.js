const userOne = {
  id_user: 239,
  user_first_name: "KyleXY",
  user_middle_name: "clone",
  user_last_name: "Science",
  user_email: "kyle@mail.com",
  user_password: "clone",
  id_user_title: 1,
}

const orderOne = {
  id_order: 8,
  id_order_status: 1,
}

const userTwo = {
  user_first_name: "jakata",
  user_last_name: "paul",
  user_password: "pass123456789",
  user_gender: "male",
  id_user_status: 1,
  user_email: "jakata@mail.com",
  id_user_title: 1,
}

const productOne = {
  id_product: 3,
  id_category: 2,
  product_title: "HP",
  product_desc: "HP",
  id_product_thumbnail: 2,
}

const productTwo = {
  p2v_price: 105,
  id_category: 1,
  id_vendor: 3,
  product_title: "test product xyz",
  product_desc: "the best product in the world",
  thumbnail: {
    name: "image",
    title: "product image",
  },
}

const vendorTwo = {
  id_vendor_status: 1,
  business_name: "test vendor",
  vendor_phone_number: 1230456,
  vendor_address: "australia",
  vendor_short_desc: "leaders of online services",
}

utils = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6MTQ2LCJpYXQiOjE2MTk1ODYwNjV9.ksdwwz6gqlfd90PHtTcI4W61TGWvSnDB75rAHllFvb0",
  review: "Delivery was on time, product was perfect",
  id_product_m2m_vendor: 50,
  total: 1800,
  payMethod: "test pay",
}

module.exports = {
  utils,
  userOne,
  userTwo,
  orderOne,
  productOne,
  productTwo,
  vendorTwo,
}
