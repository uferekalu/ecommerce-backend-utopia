const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')
const token = require('../../middleware/verify_token')
const bcrypt = require('bcryptjs');

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
}


const api_name = 'User update'

exports.handler = async (event, context) => {
    try {
        var datetime = await handler.datetime()
        const body = JSON.parse(event.body)

        const id_user = JSON.parse(event.pathParameters.id_user);
        
        const { 
            user_first_name, 
            user_last_name, 
            user_middle_name,
            user_address_shipping,
            user_address_billing,
            user_password,
            user_dob,
            user_gender,
            id_user_status,
            user_email,
            user_phone_number,
            id_user_title,
            id_vendor,
        } = body

        const password_hashed = await passwordHash(user_password)
        
        const user_exist = await db.search_one( "users","id_user", id_user)

        if (user_exist.length == 0) {
            console.log("User is not found")
            return handler.returner([false, { message: "User is not found" }], api_name, 404)
        } else {
            const created_token = await token.create_token(id_user)

            const updated_data = {
                user_first_name: user_first_name,  
                user_last_name:  user_last_name,  
                user_middle_name: user_middle_name,
                user_address_shipping: user_address_shipping,
                user_address_billing: user_address_billing,
                user_password: password_hashed,
                user_dob: user_dob,
                user_gender: user_gender,
                id_user_status: id_user_status,
                user_email: user_email,
                user_phone_number: user_phone_number,
                id_user_title: id_user_title,
                id_vendor: id_vendor,
                user_datetime_created: datetime

            }

            const update = await db.update_one(
                "users",
                updated_data,
                "id_user",
                id_user
            );

            if (update) {
                return handler.returner(
                    [true, 
                        { 
                            message: "User updated successfully", 
                            data: updated_data,
                            token: created_token  
                        }
                    ], 
                    api_name, 
                    201
                )
            }
        }   

    } catch (e) {
        console.log("Error: ", e);
        return handler.returner([false, e.toString()], api_name, 500);
    }
}