const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')



const api_name = "User login"
exports.handler = async (event, context) => {
    try {
  /* the code is not completed yet, next push will be */
    


    } catch (e) {
        console.log("Error :", e)
        return handler.returner([false, e], api_name, 500)
    }
}