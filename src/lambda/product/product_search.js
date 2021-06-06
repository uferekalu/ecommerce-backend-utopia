const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"
const error_one = "product not found, please try another search"

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
            data = await db.select_all_from_join_with_condition(
                "products_m2m_vendors",
                "products",
                "id_product",
                { id_category }
            )
        }

        //condition 2
        if (id_category && id_category > 1 && keyword) {
            data = await db.select_all_from_join_with_condition_and_regex(
                "products_m2m_vendors",
                "products",
                "id_product",
                { id_category },
                "product_title",
                regex
            )
        }

        //condition 3
        if (id_category && id_category <= 1 && !keyword) {
            data = await db.select_all_from_join("products_m2m_vendors", "products", "id_product")
        }

        //condition 4
        if (id_category && id_category <= 1 && keyword) {
            data = await db.select_all_from_join_with_regex(
                "products_m2m_vendors",
                "products",
                "id_product",
                "product_title",
                regex
            )
        }

        if (data.length === 0) {
            throw `${error_one}`
        }

        return handler.returner([true, data], api_name)
        //
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
