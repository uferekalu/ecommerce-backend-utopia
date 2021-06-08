const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product details get"
const error_one = "product not found"

exports.handler = async (event) => {
    try {
        const param = event.pathParameters
        const { id_product_m2m_vendor } = param

        // const details = await db.select_all_from_join3_with_condition(
        //     "products_m2m_vendors",
        //     "products",
        //     "vendors",
        //     "id_product", 
        //     "id_vendor",
        //     { id_product_m2m_vendor }
        // )
        const details = await db.select_all_from_join4_with_condition(
            "products_m2m_vendors",
            "products",
            "vendors",
            "product_thumbnails",
            "id_product", 
            "id_vendor",
            "id_product_thumbnail",
            { id_product_m2m_vendor }
        )

        if (details.length === 0) {
            throw `${error_one}`
        }

        const product = details[0]

        const variants = product.variant

        let variant_list = variants.map((variant) => {
            return variant
        })

        const data = {
            product,
            variant_list
        }

        return handler.returner([true, data], api_name)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
