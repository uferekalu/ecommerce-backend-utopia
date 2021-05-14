const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Vendors"
const error_one = "vendors not found, please try another search"

exports.handler = async (event, context) => {
    try {
        //query carries index for pagination optimization
        const query = event.pathParameters

        const body = JSON.parse(event.body)

        //condition 1: if no vendor is inputed, return all vendors
        if (!body || JSON.stringify(body) === "{}" || (!body.search && !body.id_vendor)) {
            //set limit of data return to the client
            const limit = 20
            const search_result = await db.select_and_limit(
                "vendors",
                "id_vendor",
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

        if (all_fields.includes("id_vendor") && regex) {
            //condition 2: id_category is defined and search is defined
            const { id_vendor } = body

            search_result = await db.search_with_regexp_compound_and(
                "vendors",
                "business_name",
                regex,
                { id_vendor }
            )
        } else if (all_fields.includes("id_vendor") && !regex) {
            //condition 3: id_category is defined and search is undefined
            const { id_vendor } = body
            search_result = await db.search_one("vendors", "id_vendor", id_vendor)
        } else {
            //condition 4: id_category is undefined and search is defined
            search_result = await db.search_with_regexp_compound("vendors", "business_name", regex)
        }

        if (search_result.length < 1) {
            throw `${error_one}`
        }

        return handler.returner([true, search_result], api_name)

        // const limit = 20

        // const search_vendors = await db.select_and_limit("vendors", "id_vendor", query.index, limit) 

        // if (search_vendors.length < 1) {
        //     throw "No vendor found"
        // }

        // const vendors = search_vendors.map((vendor) => vendor.business_name)
        // return handler.returner([true, { vendors }], api_name, 200)
    } catch (e) {
        if (e === error_one) {
            return handler.returner([false, e], api_name, 400)
        }
        return handler.returner([false, e], api_name, 500)
    }
}
