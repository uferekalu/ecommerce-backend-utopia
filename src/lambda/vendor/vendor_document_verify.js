const db = require("../../lib/database/query");

const api_name = "Vendors Document Verify";

const send = (status, html) => {
    return {
        statusCode: status,
        headers: {
            'Content-Type': 'text/html',
        },
        body: `
         <div style="width: 100%;margin: 10px;text-align:center">
                <div style="font-weight: bold;font-size: 20px">Vendor Document Verification</div>
                ${html}
         </div>`
    }
}

exports.handler = async (event, context) => {
    try {
        const params = event.pathParameters;

        const token = params['token'];

        const vendor = (await db.search_one("vendors", "token", token))?.[0];

        if (vendor) {

            if (vendor.is_documents_verified) {
                return send(200, (`<div style="color: green">Vendor ${vendor.business_name} is already verified !</div>`))
            } else {
                await db.update_one("vendors", { is_documents_verified: 1 }, "token", token);

                return send(200, (`<div style="color: green">All the documents for ${vendor.business_name} are verified successfully !</div>`))
            }
        } else {
            return send(400, ("<div style='color: red'>Error : 'No vendor found, token invalid'}</div>"))
        }
    } catch (e) {
        return send(404, (`<div style='color: red'>Error : ${e.message || 'No vendor found'}</div>`))
    }
}
