let empolyees = [
    { "123dfrdv450": { first_name: "Ali", last_name: "Ahmed", email: "ali124@gmail.com", phone: "54789045645", salary: 12000 } },
    { "5ergvfd7580": { first_name: "Sara", last_name: "Saad", email: "sara128@gmail.com", phone: "54878621075", salary: 17000 } },
    { "123sefvd450": { first_name: "Mohammad", last_name: "Wael", email: "moh170@gmail.com", phone: "48786305437", salary: 20000 } },
]


exports.handler = async function (event) {

    //if no Token
    if (!event.body) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'missing your token in body' })
        }
    }

    let { token } = JSON.parse(event.body);

    for (let empolyee in empolyees) {
        if (empolyee[token]) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                api: "get user's first and last name",
                body: JSON.stringify({
                    data: {
                        first_name: empolyee[token].first_name,
                        last_name: empolyee[token].last_name
                    }
                })
            }
        }
    }


    return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'User that belongs to token is not found' })
    }
}