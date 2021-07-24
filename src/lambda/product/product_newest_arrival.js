const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Products new arrival"

exports.handler = async (event) => {
    try {
        const param = event.pathParameters

        const isLimited = param?.limit

        let data

        if (isLimited) {
            const { limit } = param
            data = await db.select_all_from_join4_with_conditions_and_order_and_limit(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "vendors",
                "id_product",
                "id_product_thumbnail",
                "id_vendor",
                "products_m2m_vendors.is_active = 1",
                "vendors.id_vendor_status = 2",
                "products_m2m_vendors.created_at",
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
                "products_m2m_vendors.is_active = 1",
                "vendors.id_vendor_status = 2",
                "products_m2m_vendors.created_at",
                "DESC"
            )
        }
        return handler.returner([true, data], api_name)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
