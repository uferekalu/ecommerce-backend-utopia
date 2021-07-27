const handler = require("../../middleware/handler")
const db = require("../../lib/database/query")
const auth_token = require("../../middleware/token_handler")
const send = require("../../lib/services/email/send_email")

const api_name = "Order update"
const custom_errors = [
    "body is empty",
    "authentication required",
    "order not found",
    "there is nothing to update",
]

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.name = "utopiaError"
    }
}

const email_info = {
    user_email: "",
    user_first_name: "",
    subject: "",
    message: "",
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        const datetime = await handler.datetime()

        if (!body || JSON.stringify(body) === "{}") {
            throw `${custom_errors[0]}`
        }

        const all_fields = Object.keys(body)

        //more error handling
        const required_fields = ["id_order", "token", "id_order_status", "key"]

        const missing_fields = required_fields.filter((field) => !all_fields.includes(field))

        if (missing_fields.length > 0) {
            throw new CustomError(missing_fields)
        }

        const { id_order, token, id_order_status, key, ...others } = body
        let data, message, order_exist, email_sent, new_order_status
        let email_info = {}
        data = { ...others }

        const id_user = await auth_token.verify(token)

        if (!id_user) {
            throw `${custom_errors[1]}`
        }

        const { user_email, user_first_name } = (
            await db.select_all_with_condition("users", { id_user })
        )[0]

        email_info.user_first_name = user_first_name
        email_info.user_email = user_email
        id_order_status.datetime_updated = datetime
        var orderId = "";

        // Convert isPaid to 1
        if (key == "order_paid" && Array.isArray(id_order)) {
            const order_update = id_order.map(async (order) => {
                orderId = order;
                order_exist = (
                    await db.select_one_with_2conditions("orders", { id_order: order }, { id_user })
                )[0]

                if (!order_exist) {
                    throw `${custom_errors[2]}`
                }

                new_order_status = JSON.parse(order_exist.id_order_status)
                new_order_status.push(id_order_status)
                data.id_order_status = JSON.stringify(new_order_status)

                await db.update_with_condition("orders", data, { id_order: order })
            })
            await Promise.all(order_update)

            email_info.subject = "Order Created!"
            email_info.message = `Your order has been placed successfully!`

            email_sent = await send.email(email_info);

            email_info.subject = user_first_name + " Created an order!"
            email_info.message = `Order has been placed successfully!`
            email_info.user_email = await db.select_all_from_join3_with_condition(
                "products_m2m_vendors",
                "orders_m2m_products",
                "users",
                "id_product_m2m_vendor",
                "id_vendor",
                { orderId }
            )[0].user_email;

            email_sent = await send.email(email_info);

        }

        // Buyer update order
        if (key == "buyer_order_update") {
            order_exist = (
                await db.select_one_with_2conditions("orders", { id_order }, { id_user })
            )[0]

            if (!order_exist) {
                throw `${custom_errors[2]}`
            }

            id_order_status.datetime_updated = datetime
            new_order_status = JSON.parse(order_exist.id_order_status)
            new_order_status.push(id_order_status)
            data.id_order_status = JSON.stringify(new_order_status)

            if (id_order_status.id_order_status == 6 || id_order_status.id_order_status == 5) {
                if (id_order_status.id_order_status === 6) {
                    email_info.subject = `Return request for order ${id_order}`
                    email_info.message = `The order with an ID of ${id_order} has been requested for a return.`
                    message = `Your order with ID ${id_order} has been submitted for return. You would be contacted shortly.`
                } else if (id_order_status.id_order_status === 5) {
                    email_info.subject = `Order completed for Order ${id_order}`
                    email_info.message = `The order with an ID of ${id_order} has been completed by the buyer.`
                    message = `Your order with ID ${id_order} has been completed successfully!`
                }

                //Send email
                await send.email(email_info)

                email_info.user_email = await db.select_all_from_join3_with_condition(
                    "products_m2m_vendors",
                    "orders_m2m_products",
                    "users",
                    "id_product_m2m_vendor",
                    "id_vendor",
                    { id_order }
                )[0].user_email;

                //Send email to vendior
                await send.email(email_info)

                await db.update_with_condition("orders", data, { id_order })
            }
        }

        if (key == "vendor_order_update") {
            const { id_vendor } = (await db.select_all_with_condition("users", { id_user }))[0]
            order_exist = await db.select_all_from_join3_with_2condition(
                "orders",
                "orders_m2m_products",
                "products_m2m_vendors",
                "id_order",
                "id_product_m2m_vendor",
                { "products_m2m_vendors.id_vendor": id_vendor },
                {
                    "orders.id_order": id_order,
                }
            )

            if (!order_exist) {
                throw `${custom_errors[2]}`
            }

            if (id_order_status == 3 || id_order_status == 4 || id_order_status === 7) {
                if (id_order_status == 3) {
                    email_info.subject = `Order ${id_order} is being processed`
                    email_info.message = `The order with an ID of ${id_order} has currently started processing.`
                    message = `Your order with ID ${id_order} has started processing.`
                } else if (id_order_status == 4) {
                    email_info.subject = `Order in transit for Order ${id_order}`
                    email_info.message = `The order with an ID of ${id_order} is now in transit and would be with you shortly!`
                    message = `Your order with ID ${id_order} is in transit!`
                } else if (id_order_status == 7) {
                    email_info.subject = `Order return completed for Order ${id_order}`
                    email_info.message = `The order with an ID of ${id_order} has been returned successfully!`
                    message = `Your order with ID ${id_order} has been returned successfully!`
                }

                //Send email
                await send.email(email_info)
                // await send.email_result("customercare@utopiatech.io", email_info)
                await db.update_with_condition("orders", { id_order_status }, { id_order })
            } else {
                throw `${custom_errors[3]}`
            }
        }

        return handler.returner([true, { id_order, message }], api_name, 201)
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
