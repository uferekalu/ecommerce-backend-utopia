const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const bcrypt = require("bcryptjs")

const api_name = "product update"
const custom_errors = [
    "body is empty",
    "user does not exist",
    "authentication required",
    "nothing to update",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)
        const required_fields = ["id_vendor", "token"]
        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        //if required fields are missing, it throws error
        if (missing_fields.length > 0) {
            throw CustomError(missing_fields)
        }
        const { id_vendor, token, ...others } = body

        console.log(body);

        //checks if vendor exists
        const user_exist = await db.search_one("vendors", "id_vendor", id_vendor)

        if (user_exist.length < 1) {
            throw `${custom_errors[1]}`
        }
        //checks if token matches
        const isAuth = await db.search_one("user_tokens", "token", token)

        if (isAuth.length < 1) {
            throw `${custom_errors[2]}`
        }

        //not sure what this does
        const optional_fields = Object.keys(others)
        if (optional_fields.length < 1) {
            throw `${custom_errors[3]}`
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
            p2v_promo_off,
            is_sale,
            is_active,
            ...other
        } = updated_data

        if (others.product_thumbnail?.url) {
            const success = await db.update_with_condition(
                "product_thumbnails",
                { url: product_thumbnail.url },
                {
                    id_product_thumbnail,
                }
            )
        }

        let array_shipping_locations

        if (!shipping_locations) {
            array_shipping_locations = JSON.stringify({})
        } else {
            array_shipping_locations = JSON.stringify(shipping_locations)
        }

        const product_m2m_vendor_data = {
            p2v_price: p2v_price,
            p2v_promo_price: p2v_promo_price,
            inventory: inventory,
            SKU: SKU,
            shipping_cost_local: shipping_cost_local,
            shipping_cost_intl: shipping_cost_intl,
            shipping_locations: array_shipping_locations,
            is_active,
            p2v_promo_off,
            is_sale,
        }
        const product_data = {
            product_title: product_title,
            product_desc: product_desc,
            id_category,
        }

        await db.update_with_condition("products_m2m_vendors", product_m2m_vendor_data, {
            id_product_m2m_vendor,
        })
        await db.update_with_condition("products", product_data, { id_product })

        return handler.returner([true, updated_data], api_name, 201)
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
