const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Products on promo"

exports.handler = async (event) => {
    try {
        const param = event.pathParameters

        const isLimited = param?.limit

        let data

        if (isLimited) {
            const { limit } = param
            data = await db.select_all_from_join4_with_condition_order_and_limit(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "vendors",
                "id_product",
                "id_product_thumbnail",
                "id_vendor",
                "products_m2m_vendors.is_active = 1 AND products_m2m_vendors.is_deleted = 0",
                "vendors.id_vendor_status = 2",
                "p2v_promo_off",
                limit,
                "DESC"
            )
        }

        if (!isLimited) {
            data = await db.select_all_from_join4_with_conditions_and_order(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "vendors",
                "id_product",
                "id_product_thumbnail",
                "id_vendor",
                "products_m2m_vendors.is_active = 1 AND products_m2m_vendors.is_deleted = 0",
                "vendors.id_vendor_status = 2",
                "p2v_promo_off",
                "DESC"
            )
        }

        return handler.returner([true, data], api_name)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
