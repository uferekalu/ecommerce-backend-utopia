const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"

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
            vendors = await db.select_all_from_join_with_condition(
                "vendors",
                "vendor_statuses",
                "id_vendor_status",
                { "vendor_statuses.id_vendor_status": 2 }
            )
        }

        return handler.returner([true, { vendors }], api_name, 200)
    } catch (e) {
        return handler.returner([false], api_name, 500)
    }
}
