const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product create"

exports.handler = async (event, context) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw "body is empty"
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = [
            "p2v_price",
            "id_category",
            "id_vendor",
            "product_title",
            "product_desc",
            "shipping_locations",
        ]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw Error(missing_fields)
        }

        const {
            p2v_price,
            id_category,
            id_vendor,
            product_title,
            product_desc,
            shipping_locations,
            ...others
        } = body

        const category_id = await db.search_one(
            "product_categories",
            "id_product_category",
            id_category
        )

        if (category_id.length < 1) {
            throw "Category is invalid"
        }

        const optional_fields = Object.keys(others)

        async function getNewTagsId() {
            if (others && optional_fields.includes("tags")) {
                const { tags } = others
                const tags_string = JSON.stringify(tags)
                const new_tag = await db.insert_new({ tag_name: tags_string }, "product_tags")
                return new_tag.insertId
            }
        }

        const new_tags_id = await getNewTagsId()

        async function getNewProductId() {
            let new_product_record
            if (new_tags_id) {
                new_product_record = await db.insert_new(
                    {
                        id_category: category,
                        product_title,
                        product_desc,
                        id_tags: new_tags_id,
                        created_at: datetime,
                    },
                    "products"
                )
            }

            if (!new_tags_id) {
                new_product_record = await db.insert_new(
                    {
                        id_category,
                        product_title,
                        product_desc,
                    },
                    "products"
                )
            }
            return new_product_record.insertId
        }

        const new_product_id = await getNewProductId()

        if (!new_product_id) {
            throw "product create unsuccessful"
        }

        let id_product_thumbnail

        if (!optional_fields.includes("product_thumbnail")) {
            id_product_thumbnail = await db.insert_new({ alt: product_title }, "product_thumbnails")
        }

        if (optional_fields.includes("product_thumbnail") && others.product_thumbnail?.url) {
            const { url } = others.product_thumbnail
            id_product_thumbnail = await db.insert_new(
                { url, alt: product_title, created_at: datetime },
                "product_thumbnails"
            )
        }

        const is_active = others.product_thumbnail?.url === true

        //collates p2v_promo_price and/or id_brand optional fields if provided
        const new_p2v_data = {}
        for (let prop in others) {
            if (prop === "p2v_promo_price" || prop === "id_brand") {
                new_p2v_data[prop] = others[prop]
            }
        }

        let array_shipping_locations

        if (!shipping_locations) {
            array_shipping_locations = JSON.stringify([])
        } else {
            array_shipping_locations = JSON.stringify(shipping_locations)
        }

        async function getNewProductVendorId() {
            const new_product_m2m_vendor = await db.insert_new(
                {
                    ...new_p2v_data,
                    id_vendor,
                    p2v_price,
                    id_product: new_product_id,
                    is_active,
                    shipping_locations: array_shipping_locations,
                },
                "products_m2m_vendors"
            )
            return new_product_m2m_vendor.insertId
        }

        const new_product_m2m_vendor_id = await getNewProductVendorId()

        if (!new_product_m2m_vendor_id) {
            throw "id_vendor is invalid"
        }

        //P.S product_images is a multidimensional array nesting each image object
        if (optional_fields.includes("product_images")) {
            const { product_images } = optional_fields
            const images = JSON.stringify(product_images)
            await db.insert_new(
                {
                    images,
                    product_id: new_product_id,
                    id_product_m2m_vendor: new_product_m2m_vendor_id,
                },
                "product_images"
            )
        }

        const product = {
            product_id: new_product_id,
            id_product_m2m_vendor: new_product_m2m_vendor_id,
            product_title,
            product_desc,
            // shipping_locations
            shipping_locations: array_shipping_locations,
        }

        return handler.returner([true, { ...product, is_active }], api_name, 201)
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
        return handler.returner([false, e], api_name, 500)
    }
}
