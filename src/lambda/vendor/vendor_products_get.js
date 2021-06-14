const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendor products get"
const error_one = "vendor not found"
const error_two = "no products found"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_vendor } = param

        const vendor = await db.search_one("vendors", "id_vendor", id_vendor)

        if (vendor.length < 1) {
            throw `${error_one}`
        }

        const data = await db.select_all_from_join4_with_condition(
            "products",
            "products_m2m_vendors",
            "product_thumbnails",
            "vendors",
            "id_product",
            "id_product_thumbnail",
            "id_vendor",
            { "vendors.id_vendor": id_vendor }
        )

        if (data.length < 1) {
            throw `${error_two}`
        }

        return handler.returner([true, data], api_name, 200)
    } catch (e) {
        if (e === error_one || e === error_two) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
