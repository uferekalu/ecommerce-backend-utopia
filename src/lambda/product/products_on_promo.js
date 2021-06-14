const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Products on promo"
const error_one = "no products on promotion"

exports.handler = async (event) => {
    try {
        const param = event.pathParameters

        const isLimited = param?.limit
        let data

        if (isLimited) {
            const { limit } = param
            data = await db.select_all_with_condition_order_and_limit(
                "products_m2m_vendors",
                "p2v_promo_off",
                { is_sale: "true" },
                limit,
                "DESC"
            )
        }

        if (!isLimited) {
            data = await db.select_all_with_condition_and_order(
                "products_m2m_vendors",
                "p2v_promo_off",
                { is_sale: "true" },
                "DESC"
            )
        }

        if (data.length < 1) {
            throw `${error_one}`
        }

        return handler.returner([true, data], api_name)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
