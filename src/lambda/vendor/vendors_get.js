const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"
const error_one = "vendors not found, please try another search"

exports.handler = async (event, context) => {
    try {
        const query = event.pathParameters

        const body = JSON.parse(event.body)

        let keyword = body.search

        let search_vendors

        const limit = 20

        if (keyword) {
            const { search } = body
            const cap_search = search.toUpperCase()
            const search_split = cap_search.split(/,\s|\s+/)
            const keywords = search_split.filter((word) => word.length > 1)
            if (keywords.length > 0) {
                const regex = keywords.join("|")
                search_vendors = await db.select_many_with_regex_and_limit(
                    "vendors",
                    ["*"],
                    "business_name",
                    regex,
                    limit
                )
            } else {
                keyword = undefined
            }
        }

        if (!body || !keyword) {
            search_vendors = await db.select_and_limit("vendors", "id_vendor", query.index, limit)
        }

        if (search_vendors.length < 1) {
            throw `${error_one}`
        }

        const vendors = search_vendors.map((vendor) => {
            delete vendor.created_at
            delete vendor.updated_at
            return vendor
        })

        return handler.returner([true, { vendors }], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
