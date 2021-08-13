const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const { index, id_category, keyword } = param

        let data, regex

        //splits long string from search field and adds | consumable by mysql
        if (keyword) {
            const cap_keyword = keyword.toUpperCase()
            const keywords_split = cap_keyword.split(/,\s|\s+/)
            regex = keywords_split.join("|")
        }

        //condition 1
        if (id_category && id_category > 1 && !keyword) {
            data = await db.select_all_from_join4_with_2conditions(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "vendors",
                "id_product",
                "id_product_thumbnail",
                "id_vendor",
                "products_m2m_vendors.is_active = 1 AND products_m2m_vendors.is_deleted = 0 AND vendors.id_vendor_status = 2",
                { id_category }
            )
        }

        //condition 2
        if (id_category && id_category > 1 && keyword) {
            data = await db.select_all_from_join3_with_condition_and_regex(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "id_product",
                "id_product_thumbnail",
                { id_category },
                "product_title",
                regex
            )
        }

        //condition 3
        if (id_category && id_category <= 1 && !keyword) {
            data = await db.select_all_from_join4_with_conditions(
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
        }

        //condition 4
        if (id_category && id_category <= 1 && keyword) {
            data = await db.select_all_from_join3_with_regex(
                "products",
                "products_m2m_vendors",
                "product_thumbnails",
                "id_product",
                "id_product_thumbnail",
                "product_title",
                regex
            )
        }

        const result = data.filter(product => product.is_deleted === 0) || []
        
        return handler.returner([true, result], api_name)

    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
