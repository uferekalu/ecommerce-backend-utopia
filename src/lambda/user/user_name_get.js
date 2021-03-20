const parser = require("body-parser-for-serverless");
const handler = require('../../middleware/handler')
const api_name = "Get username"

let empolyees = [
    { "123dfrdv450": { first_name: "Ali", last_name: "Ahmed", email: "ali124@gmail.com", phone: "54789045645", salary: 12000 } },
    { "5ergvfd7580": { first_name: "Sara", last_name: "Saad", email: "sara128@gmail.com", phone: "54878621075", salary: 17000 } },
    { "123sefvd450": { first_name: "Mohammad", last_name: "Wael", email: "moh170@gmail.com", phone: "48786305437", salary: 20000 } },
]

exports.handler = async function (event) {
    try {
        const body = JSON.parse(event.body);
        let { token } = body

        if (!token) {
            return handler.returner([false, { message: 'missing your  value of token in body' }], api_name, 400)
        }

        for (let empolyee of empolyees) {
            if (empolyee[token]) {
                const data = {
                    first_name: empolyee[token].first_name,
                    last_name: empolyee[token].last_name
                }
                return handler.returner([true, data], api_name, 200)

            }
        }

        return handler.returner([false, { message: 'User that belongs to token is not found' }], api_name, 404)

    } catch (error) {
        return handler.returner([false, error], api_name, 500)
    }
}