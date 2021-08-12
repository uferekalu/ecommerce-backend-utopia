const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product create"
const custom_errors = [
    "body is empty",
    "category is invalid",
    "product create unsuccessful",
    "vendor is invalid",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

exports.handler = async (event, context) => {
    try {
        const datetime = await handler.datetime()
        const body = JSON.parse(event.body)
        //error handling
        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
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
            "SKU",
            "is_active",
        ]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const {
            p2v_price,
            id_category,
            id_vendor,
            product_title,
            product_desc,
            shipping_locations,
            is_combined_shipping = 0,
            SKU,
            p2v_promo_off,
            is_sale,
            is_active,
            ...others
        } = body

        const category_id = await db.search_one(
            "product_categories",
            "id_product_category",
            id_category
        )

        if (category_id.length < 1) {
            throw `${custom_errors[1]}`
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
            let id_product_thumbnail

            if (!others.product_thumbnail?.url) {
                id_product_thumbnail = await db.insert_new(
                    { alt: product_title },
                    "product_thumbnails"
                )
            } else if (
                optional_fields.includes("product_thumbnail") &&
                others.product_thumbnail?.url
            ) {
                const { url } = others.product_thumbnail

                id_product_thumbnail = await db.insert_new(
                    { url, alt: product_title, created_at: datetime },
                    "product_thumbnails"
                )
            }

            let new_product_record
            if (new_tags_id) {
                new_product_record = await db.insert_new(
                    {
                        id_category: category,
                        product_title,
                        product_desc,
                        id_tags: new_tags_id,
                        created_at: datetime,
                        id_product_thumbnail: id_product_thumbnail.insertId,
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
                        created_at: datetime,
                        id_product_thumbnail: id_product_thumbnail.insertId,
                    },
                    "products"
                )
            }
            return new_product_record.insertId
        }

        const new_product_id = await getNewProductId()

        if (!new_product_id) {
            throw `${custom_errors[2]}`
        }

        //collates p2v_promo_price and/or id_brand optional fields if provided
        const new_p2v_data = {}
        for (let prop in others) {
            if (
                prop === "p2v_promo_price" ||
                prop === "id_brand" ||
                prop === "shipping_cost_local" ||
                prop === "shipping_cost_intl"
            ) {
                new_p2v_data[prop] = others[prop]
            }
        }

        let array_shipping_locations

        if (!shipping_locations) {
            array_shipping_locations = JSON.stringify({})
        } else {
            array_shipping_locations = JSON.stringify(shipping_locations)
        }

        async function getNewProductVendorId() {
            const new_product_m2m_vendor = await db.insert_new(
                {
                    ...new_p2v_data,
                    id_vendor,
                    p2v_price,
                    shipping_locations: array_shipping_locations,
                    is_combined_shipping,
                    SKU,
                    id_product: new_product_id,
                    is_active,
                    inventory: others.inventory,
                    p2v_promo_off,
                    is_sale,
                    is_active,
                },
                "products_m2m_vendors"
            )
            return new_product_m2m_vendor.insertId
        }

        const new_product_m2m_vendor_id = await getNewProductVendorId()

        if (!new_product_m2m_vendor_id) {
            throw `${custom_errors[3]}`
        }

        //P.S product_images is a multidimensional array nesting each image object
        if (optional_fields.includes("product_images") && others.product_images.length > 0) {
            const { product_images } = others

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
            shipping_locations: array_shipping_locations,
        }

        return handler.returner([true, { ...product, is_active }], api_name, 201)
        /*
         */
    } catch (e) {
        let errors = await handler.required_field_error(e)
        if (custom_errors.includes(e)) {
            errors = e
        }
        if (errors) {
            return handler.returner([false, errors], api_name, 400)
        }
        return handler.returner([false], api_name, 500)
    }
}
