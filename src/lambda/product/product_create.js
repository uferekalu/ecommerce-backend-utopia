const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")

const api_name = "Product create"

exports.handler = async (event, context) => {
    try {
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
            "id_product_thumbnail",
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
            id_product_thumbnail,
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

        //checks if tags field is provided
        //concatenates tags[],
        //inserts new record (concatenated tags) into product_tags table,
        //returns tags_id
        async function getNewTagsId() {
            if (others && optional_fields.includes("tags")) {
                const { tags } = others
                const new_tag = await db.insert_new({ tag_name: tags.join(", ") }, "product_tags")
                return new_tag.insertId
            }
        }

        //retrieves tags_id from product_tags table
        const new_tags_id = await getNewTagsId()

        //recieves tags_id (if truthy) as FK ref product_tags
        //inserts new record into the products table
        //returns product_id
        async function getNewProductId() {
            let new_product_record
            if (new_tags_id) {
                new_product_record = await db.insert_new(
                    {
                        id_category: category,
                        id_product_thumbnail,
                        product_title,
                        product_desc,
                        id_tags: new_tags_id,
                    },
                    "products"
                )
            } else {
                new_product_record = await db.insert_new(
                    {
                        id_category,
                        product_title,
                        product_desc,
                        id_product_thumbnail,
                    },
                    "products"
                )
            }
            return new_product_record.insertId
        }

        //retrieves product_id from products table
        const new_product_id = await getNewProductId()

        if (!new_product_id) {
            throw "product create unsuccessful"
        }

        //collates p2v_promo_price and/or id_brand optional fields if provided
        const new_p2v_data = {}
        for (let prop in others) {
            if (prop === "p2v_promo_price" || prop === "id_brand") {
                new_p2v_data[prop] = others[prop]
            }
        }

        //inserts new record into products_m2m_vendors table
        //recieves new_product_id as FKs ref products table
        async function getNewProductVendorId() {
            const new_product_m2m_vendor = await db.insert_new(
                { ...new_p2v_data, id_vendor, id_product: new_product_id },
                "products_m2m_vendors"
            )
            return new_product_m2m_vendor.insertId
        }

        //retrieves id_product_m2m_vendor from products_m2m_vendors table
        const new_product_m2m_vendor_id = await getNewProductVendorId()

        if (!new_product_m2m_vendor_id) {
            throw "id_vendor is invalid"
        }

        //inserts new record(s) into product_images
        //recieves new_product_id and new_product_m2m_vendor.insertId as FKs
        //ref products and products_m2m_vendors tables resp
        //P.S product_images is a multidimensional array nesting each image object
        if (others && optional_fields.includes("product_images")) {
            const { product_images } = optional_fields

            product_images.map(async (image) => {
                await db.insert_new(
                    {
                        ...image,
                        product_id: new_product_id,
                        id_product_m2m_vendor: new_product_m2m_vendor_id,
                    },
                    "product_images"
                )
            })
        }

        return handler.returner(
            [
                true,
                {
                    product_id: new_product_id,
                    id_product_m2m_vendor: new_product_m2m_vendor_id,
                    product_title,
                    product_desc,
                },
            ],
            api_name,
            201
        )
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
