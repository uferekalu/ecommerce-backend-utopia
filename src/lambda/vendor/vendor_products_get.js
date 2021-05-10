const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendor products get"
const error_one = "vendor not found"
const error_two = "no products found"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { id_vendor, index } = param

        const vendor = await db.search_one("vendors", "id_vendor", id_vendor)

        if (vendor.length < 1) {
            throw `${error_one}`
        }

        const { business_name } = vendor[0]

        const limit = 20

        const id_product_array = await db.select_one_with_condition_and_limit(
            "products_m2m_vendors",
            "id_product",
            { id_vendor },
            index,
            limit
        )

        if (id_product_array.length < 1) {
            throw `${error_two}`
        }

        const products_search = id_product_array.map(async (obj) => {
            const res = await db.search_one("products", "id_product", obj.id_product)
            return res[0]
        })

        const products = await Promise.all(products_search)

        if (products.length < 1) {
            throw `${error_two}`
        }

        const data = {
            business_name,
            products,
        }

        return handler.returner([true, data], api_name, 200)
    } catch (e) {
        if (e === error_one || e === error_two) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
