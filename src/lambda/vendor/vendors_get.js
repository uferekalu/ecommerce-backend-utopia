const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"
const error_one = "vendors not found, please try another search"

exports.handler = async (event, context) => {
    try {
        const param = event.pathParameters

        const keyword = param?.keyword

        let vendors

        if (keyword) {
            const cap_keyword = keyword.toUpperCase()
            const keyword_split = cap_keyword.split(/,\s|\s+/)
            const keywords = keyword_split.filter((word) => word.length > 1)
            if (keywords.length > 0) {
                const regex = keywords.join("|")
                vendors = await db.select_with_regex("vendors", "business_name", regex)
            }
        } else {
            vendors = await db.select_all("vendors")
        }

        if (vendors.length < 1) {
            throw `${error_one}`
        }

        // const vendors = vendors.map((vendor) => {
        //     delete vendor.created_at
        //     delete vendor.updated_at
        //     return vendor
        // })

        return handler.returner([true, { vendors }], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
