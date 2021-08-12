const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const api_name = "Order create"
const custom_errors = [
    "body is empty",
    "user not found",
    "orders_m2m_products not created successfully",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const datetime = await handler.datetime()

        const body = JSON.parse(event.body)

        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["id_user", "id_product_m2m_vendor", "shipping_cost_product_ids", "paymentMethod"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { id_user, id_product_m2m_vendor, shipping_cost_product_ids = [], paymentMethod } = body

        // ensure user exists
        const user_exist = await db.search_one("users", "id_user", id_user)

        //if user does not exist return error
        if (user_exist.length === 0) {
            throw `${custom_errors[1]}`
        }

        const country = (
            await db.search_get_one_column_oncondition("users", "country", "id_user", id_user)
        )[0].country

        const vcode = []
        const vsubtotal = []
        const vshippings = []
        const vproducts = []
        const quantity = []

        const mapped_prices = id_product_m2m_vendor.map(async (_id) => {
            const res = (
                await db.select_all_from_join2_with_condition_order(
                    "products_m2m_vendors",
                    "vendors",
                    "id_vendor",
                    { id_product_m2m_vendor: _id }
                )
            )[0]

            const price = res.p2v_promo_price ?? res.p2v_price

            if (!vcode.includes(res.id_vendor)) {
                vcode.push(res.id_vendor)
                vsubtotal.push(price)
                quantity.push(1)
                vproducts.push([res.id_product_m2m_vendor])

                vshippings.push(
                    shipping_cost_product_ids.includes(_id) ?
                        (
                            country === res.vendor_country
                                ? res.shipping_cost_local ?? 0
                                : res.shipping_cost_intl ?? 0
                        ) : 0
                )

                return
            }

            if (vcode.includes(res.id_vendor)) {
                const idx = vcode.indexOf(res.id_vendor)

                if (vproducts.flat().includes(res.id_product_m2m_vendor)) {
                    const qty = quantity[idx] + 1
                    vsubtotal[idx] = price * qty
                    quantity[idx]++
                } else {
                    vsubtotal[idx] + price
                    quantity.push(1)
                    vproducts[idx].push(res.id_product_m2m_vendor)
                }
                return
            }
        })

        const prices = await Promise.all(mapped_prices)
        const total = prices.reduce((sum, price) => sum + price)


        const mapped_new_order = vsubtotal.map(async (total, idx) => {
            const res = await db.insert_new(
                {
                    total: Number(Number(total) + Number(vshippings[idx])).toFixed(2),
                    shipping: vshippings[idx],
                    id_user,
                    order_created_at: datetime,
                    paymentMethod,
                    id_order_status: JSON.stringify([
                        { id_order_status: 1, order_status: "Unpaid", datetime_updated: datetime },
                    ]),
                },
                "orders"
            )
            return res.insertId
        })

        const new_orders = await Promise.all(mapped_new_order)
        
        const values = vproducts.map((product, index) => {
            const arr = product.map((_id) => [_id, new_orders[index], quantity[index]])
            return arr.flat()
        })

        const new_order_m2m_product = await db.insert_many(
            values,
            ["id_product_m2m_vendor", "id_order", "quantity"],
            "orders_m2m_products"
        )

        if (!new_order_m2m_product) {
            throw `${custom_errors[2]}`
        }

        const { affectedRows, insertId } = new_order_m2m_product
        let id_order_m2m_product = []
        for (let i = 0; i < affectedRows; i++) {
            id_order_m2m_product.push(i + insertId)
        }

        const data = {
            message: "order created successfully",
            id_order: new_orders,
        }

        return handler.returner([true, data], api_name, 201)
    } catch (e) {
        let errors = await handler.required_field_error(e)

        if (custom_errors.includes(e)) {
            errors = e
        }

        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }

        return handler.returner([false], api_name, 500)
    }
}
