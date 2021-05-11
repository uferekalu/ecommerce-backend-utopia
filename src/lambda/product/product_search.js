const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product search"
const error_one = "product not found, please try another search"

exports.handler = async (event, context) => {
    try {
        //param carries index for pagination optimization
        const param = event.pathParameters

        const { index } = param

        const body = JSON.parse(event.body)

        const limit = 20

        let data, regex, category

        const addVNamePTitleToProduct = async (p2v_search) => {
            const mapped = p2v_search.map(async (item) => {
                const vendor = await db.search_one("vendors", "id_vendor", item.id_vendor)
                const product = await db.search_one("products", "id_product", item.id_product)
                const { business_name } = vendor[0]
                const { product_title } = product[0]
                return { business_name, product_title, ...item }
            })

            return await Promise.all(mapped)
        }

        //condition 1: if no category is selected from the dropdown and no search is inputted, return all product
        if (!body || JSON.stringify(body) === "{}" || (!body.search && !body.id_category)) {
            //set limit of data return to the client
            const p2v_search = await db.select_and_limit(
                "products_m2m_vendors",
                "id_product_m2m_vendor",
                index,
                limit
            )

            const products = await addVNamePTitleToProduct(p2v_search)

            data = {
                category: "all",
                products,
            }
        }

        const all_fields = Object.keys(body)

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

        //extracts category name
        if (all_fields.includes("id_category")) {
            const { id_category } = body

            const category_search = await db.search_one(
                "product_categories",
                "id_product_category",
                id_category
            )

            category = category_search[0].category_name
        }

        //reusable function to get the data object
        const getData = async (product_search) => {
            if (product_search.length < 1) {
                return
            }

            const mapped = product_search.map(async (item) => {
                const p2v_search = await db.search_one(
                    "products_m2m_vendors",
                    "id_product",
                    item.id_product
                )

                return p2v_search
            })

            const resolved = await Promise.all(mapped)

            const flattened = resolved.flat()

            if (flattened.length < 1) {
                return
            }

            const mapper = () => {
                let arr = []
                const cap = flattened.length
                const range = +index + limit

                const end = cap > range ? range : cap
                for (let i = +index; i < end; i++) {
                    arr.push(flattened[i])
                }
                return arr
            }

            const map_result = mapper()

            const products = await addVNamePTitleToProduct(map_result)

            return {
                category,
                products,
            }
        }

        //condition 2: id_category is defined and search is defined
        if (category && regex) {
            const { id_category } = body
            const product_search = await db.select_one_with_condition_regex(
                "products",
                "id_product",
                { id_category },
                "product_title",
                regex
            )

            data = await getData(product_search)
        }

        // condition 3: id_category is defined and search is undefined
        if (category && !regex) {
            const { id_category } = body
            const product_search = await db.select_one_with_condition_and_limit(
                "products",
                "id_product",
                { id_category },
                index,
                limit
            )

            data = await getData(product_search)
        }

        //condition 4: id_category is undefined and search is defined
        if (!category && regex) {
            const product_search = await db.select_one_with_regex_and_limit(
                "products",
                "id_product",
                "product_title",
                regex,
                index,
                limit
            )

            data = await getData(product_search)
            if (data) {
                data.category = "all"
            }
        }

        if (!data || JSON.stringify(data) === "{}") {
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
