const handler = require("../../middleware/handler")
const send = require("../../lib/services/email/send_email")

const api_name = "Order completed";
const email_info = {
    subject: "Request Order completed",
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
            [true, { order_id , message: "Your Order has been completed" }],
            api_name,
            200
        )
    } catch (e) {
        return handler.returner([false, e], api_name)
    }
}
