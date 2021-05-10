const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"
const error_one = "product not found, please try another search"

exports.handler = async (event, context) => {
    try {
        //query carries index for pagination optimization
        const query = event.pathParameters

        const body = JSON.parse(event.body)

        //condition 1: if no category is selected from the dropdown and no search is inputted, return all product
        if (!body || JSON.stringify(body) === "{}" || (!body.search && !body.id_category)) {
            //set limit of data return to the client
            const limit = 20
            const search_result = await db.select_and_limit(
                "products",
                "id_product",
                query.index,
                limit
            )
            return handler.returner([true, search_result], api_name)
        }

        const all_fields = Object.keys(body)

        let search_result, regex

        //splits long string from search field and adds | consumable by mysql
        if (all_fields.includes("search")) {
            const { search } = body
            const cap_search = search.toUpperCase()
            const search_split = cap_search.split(/,\s|\s+/)
            const keywords = search_split.filter((word) => word.length > 1)
            if (keywords.length < 1) {
                regex = undefined
            } else {
                regex = keywords.join("|")
            }
        }

        if (all_fields.includes("id_category") && regex) {
            //condition 2: id_category is defined and search is defined
            const { id_category } = body

            search_result = await db.search_with_regexp_compound_and(
                "products",
                "product_title",
                regex,
                { id_category }
            )
        } else if (all_fields.includes("id_category") && !regex) {
            //condition 3: id_category is defined and search is undefined
            const { id_category } = body
            search_result = await db.search_one("products", "id_category", id_category)
        } else {
            //condition 4: id_category is undefined and search is defined
            search_result = await db.search_with_regexp_compound("products", "product_title", regex)
        }

        if (search_result.length < 1) {
            throw `${error_one}`
        }

        return handler.returner([true, search_result], api_name)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
