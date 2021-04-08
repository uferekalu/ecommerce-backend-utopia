const handler = require("../../middleware/handler");
const db = require("../../lib/database/query");
const qs = require("querystring");
//required data id_product
//-----if the id_product exists send response will all te product details
//-----if the id_product doesn't exist send response as product doesn't exist
const api_name = "Products get";
exports.handler = async (event, context) => {
  try {
    let product_search_keyword = event.pathParameters.keyword;
    //if keyword is a long string
    //let keyword_array = product_search_keyword.split(" ");
    //console.log("array ", keyword_array);
    // uniqueArray = a.filter(function (item, pos, self) {
    //   return self.indexOf(item) == pos;
    // });
    // let products_array = []; //new Array();
    //---Creating and adding data
    // let result = new Set();
    // ["ABC", "ABC"];
    // result.add();
    //---Converting set into array
    // let products_array = result.forEach((element) => {
    //   return element;
    // });

    console.log("product_search_keyword:", product_search_keyword);

    //for (keyword in keyword_array) {
    const keyword_product_result = await db.search_with_regexp(
      "products",
      "product_title",
      product_search_keyword
    );
    //.then((response) => {
    //console.log("response ", response[0].product_title);
    // products_array.push(response[0].product_title);
    //});
    // }

    console.log("keyword_product_result", keyword_product_result);
    // const product_exist = await db.search_with_regexp(
    //   "products",
    //   "product_title",
    //   product_search_keyword
    // );
    // let uniq_product_array = products_array.filter(function (item, pos, self) {
    //   return self.indexOf(item) == pos;
    // });
    if (keyword_product_result.length == 0)
      return handler.returner(
        [false, { message: "Product not found" }],
        api_name,
        404
      );

    // console.log("uniq_product_array:", uniq_product_array);
    let product_name = keyword_product_result.map(
      (product) => product.product_title
    );
    return handler.returner(
      [
        true,
        {
          products_list: product_name,
          // id_product: product_exist[0].id_product,
        },
      ],
      api_name,
      201
    );
  } catch (e) {
    console.log("Error: ", e);
    return handler.returner([false, e], api_name);
  }
};
