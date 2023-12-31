const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product get all"

exports.handler = async () => {
    try {
        const data = await db.select_all_from_join4_with_conditions(
            "products",
            "products_m2m_vendors",
            "product_thumbnails",
            "vendors",
            "id_product",
            "id_product_thumbnail",
            "id_vendor",
            "products_m2m_vendors.is_active = 1 AND products_m2m_vendors.is_deleted = 0",
            "vendors.id_vendor_status = 2"
        )

        return handler.returner([true, data], api_name)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
