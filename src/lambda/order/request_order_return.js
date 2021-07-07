const handler = require("../../middleware/handler")
const send = require("../../lib/services/email/send_email")

const api_name = "Oreder return request";
const email_info = {
    subject: "Request Order Return",
    message: "order id is ",
} 
// we can send  HTML template insted of messgae

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        const order_id = body.order_id

        //Send email 
        email_info.message += order_id;
        await send.email('customercare@utopiatech.io', email_info);
        return handler.returner(
            [true, { order_id , message: "Order return request sent to Customer Care" }],
            api_name,
            200
        )
    } catch (e) {
        console.log("Error: ", e)
        return handler.returner([false, e], api_name)
    }
}
