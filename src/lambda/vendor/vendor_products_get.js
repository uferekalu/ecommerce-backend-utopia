const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendor product get"

exports.handler = async (event, context) => {
    try {
        const query = event.pathParameters

        const vendor = await db.search_one("vendors", "id_vendor", query.id_vendor)

        if (vendor.length < 1) {
            throw "invalid vendor id"
        }

        const { id_vendor } = vendor[0]

        const productsM2MVendor = await db.search_one(
            "products_m2m_vendors",
            "id_vendor",
            id_vendor
        )

        if (productsM2MVendor.length < 1) {
            throw "No product for this vendor"
        }

        const { id_product } = productsM2MVendor[0]

        const product_search = await db.search_one(
            "products",
            "id_product",
            id_product
        )

        if (product_search.length < 1) {
            throw "Sorry, there are no products!"
        }

        let product_lists = product_search.map((product) => {
            return product.product_title;
        });

        return handler.returner([true, product_lists], api_name, 200)

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