const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendor products get"
const error_one = "vendor not found"
const error_two = "vendor is not activated"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_vendor } = param
        const inactive = param?.inactive

        const vendor = (
            await db.select_all_from_join_with_condition(
                "vendors",
                "vendor_statuses",
                "id_vendor_status",
                { id_vendor }
            )
        )[0]

        if (!vendor) {
            throw `${error_one}`
        }

        let data = []

        if (inactive && vendor) {
            data = await db.select_all_from_join3_with_condition(
                "products_m2m_vendors",
                "products",
                "vendors",
                "id_product",
                "id_vendor",
                { "vendors.id_vendor": id_vendor }
            )
        }

        if (!inactive && vendor) {
            data = await db.select_all_from_join4_with_condition(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "vendors",
                "id_product",
                "id_product_thumbnail",
                "id_vendor",
                { "vendors.id_vendor": id_vendor }
            )
        }

        const products = data?.filter(product => product.is_deleted === 0);

        return handler.returner([true, products], api_name, 200)
    } catch (e) {
        if (e === error_one || e === error_two) {
            return handler.returner([false, e], api_name, 404)
        }
        return handler.returner([false], api_name, 500)
    }
}
