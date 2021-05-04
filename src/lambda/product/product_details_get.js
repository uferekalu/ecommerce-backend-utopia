const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const qs = require("querystring")
//required data id_product

const api_name = "Product details get"
exports.handler = async (event, context) => {
    try {
        const id_product = JSON.parse(event.pathParameters.id_product)
        console.log("id_product:", id_product)
        const product_exist = await db.search_one("products", "id_product", id_product)
        //const decrypted_id = cryptr.decrypt(event.pathParameters.id_user);

        if (product_exist.length == 0)
            return handler.returner([false, { message: "Product is not found" }], api_name, 404)

        // const pass_valid = await bcrypt.compare(
        //   body.user_password,
        //   user_exist[0].user_password
        // );
        // if (!pass_valid)
        //   return handler.returner(
        //     [false, { message: "Password is invalid" }],
        //     api_name,
        //     400
        //   );

        // if (user_exist[0].email_verified != 1)
        //   return handler.returner(
        //     [false, { message: "Account is not verified" }],
        //     api_name,
        //     400
        //   );

        // const created_token = await token.create_token(user_exist[0].id_user);

        // let data = {
        //   id_user: user_exist[0].id_user,
        //   token: created_token,
        //   ut_datetime_created: await handler.datetime(),
        // };

        //const result = await db.insert_new(data, "user_tokens");
        console.log(product_exist)
        return handler.returner(
            [
                true,
                {
                    id_product: product_exist[0].id_product,
                    id_product_review: product_exist[0].id_product_review,
                    id_category: product_exist[0].id_category,
                    id_tag: product_exist[0].id_tag,
                    product_title: product_exist[0].product_title,
                    product_desc: product_exist[0].product_desc,
                    id_brand: product_exist[0].id_brand,
                    created_at: product_exist[0].created_at,
                    is_active: product_exist[0].is_active,
                    is_featured: product_exist[0].is_featured,
                    is_hot: product_exist[0].is_hot,
                    id_product_thumbnail: product_exist[0].id_product_thumbnail,
                    //   token: created_token,
                    //   user_access_level: user_exist[0].id_user_access_level,
                },
            ],
            api_name,
            200
        )
    } catch (e) {
        console.log("Error: ", e)
        return handler.returner([false, e], api_name)
    }
}
