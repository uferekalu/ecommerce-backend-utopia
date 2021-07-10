const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")

const api_name = "product update"

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)
        const required_fields = ["id_vendor", "token"]
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        //if required fields are missing, it throws error
        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }
        const { id_vendor, token, ...others } = body

        //checks if vendor exists
        const user_exist = await db.search_one("vendors", "id_vendor", id_vendor)

        if (user_exist.length < 1) {
            throw "user does not exist"
        }
        //checks if token matches
        const isAuth = await db.search_one("user_tokens", "token", token)

        if (isAuth.length < 1) {
            throw "authentication required"
        }

        //not sure what this does
        const optional_fields = Object.keys(others)
        if (optional_fields.length < 1) {
            throw "nothing to update"
        }
        //not sure what this does

        if (optional_fields.includes("user_password")) {
            delete others.user_password
        }

        const updated_data = { ...others }

        const {
            p2v_price,
            id_category,
            product_title,
            product_desc,
            shipping_locations,
            SKU,
            inventory,
            p2v_promo_price,
            id_product_m2m_vendor,
            shipping_cost_local,
            shipping_cost_intl,
            id_product,
            id_product_thumbnail,
            product_thumbnail,
            ...other
        } = updated_data

        let array_shipping_locations

        if (!shipping_locations) {
            array_shipping_locations = JSON.stringify({})
        } else {
            array_shipping_locations = JSON.stringify(shipping_locations)
        }

        const product_m2m_vendor_data =
        {
            p2v_price: p2v_price,
            p2v_promo_price: p2v_promo_price,
            inventory: inventory,
            SKU: SKU,
            shipping_cost_local: shipping_cost_local,
            shipping_cost_intl: shipping_cost_intl,
            shipping_locations: array_shipping_locations
        }
        const product_data = {
            product_title: product_title,
            product_desc: product_desc,
        }

        await db.update_with_condition("products_m2m_vendors", product_m2m_vendor_data, {
            id_product_m2m_vendor,
        })
        await db.update_with_condition("products", product_data, { id_product })

        //   await db.update_one("users", updated_data, "id_vendor", id_vendor)

        return handler.returner([true, updated_data], api_name, 201)
    } catch (e) {
        if (e.name === "Error") {
            const errors = e.message
                .split(",")
                .map((field) => {
                    return `${field} is required`
                })
                .join(", ")
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false, e], api_name, 400)
    }
}
