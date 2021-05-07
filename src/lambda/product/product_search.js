const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"

exports.handler = async (event, context) => {
    try {
        //query carries index for pagination optimization
        const query = event.pathParameters

        const body = JSON.parse(event.body)

        //if no category is selected from the dropdown and no keyword is inputed, return all product
        if (!body || JSON.stringify(body) === "{}") {
            //set limit of data return to the client
            const limit = 10
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

        if (all_fields.includes("keyword")) {
            const { keyword } = body
            const keyword_split = keyword.split(/,\s|\s+/)
            regex = keyword_split.join("|")
        }

        if (all_fields.includes("id_category")) {
            const { id_category } = body
            search_result = await db.search_with_regexp_compound_and(
                "products",
                "product_title",
                regex,
                id_category
            )
        } else {
            search_result = await db.search_with_regexp_compound("products", "product_title", regex)
        }

        if (search_result.length < 1) {
            throw "product not found, try another keyword"
        }

        return handler.returner([true, search_result], api_name)
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
