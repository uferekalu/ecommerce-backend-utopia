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
    const body = JSON.parse(event.body);
    const user_exist = await db.search_one(
        "users",
        "id_user",
        body.id_user
    );
    const password_hashed = await passwordHash(body.user_password)

    console.log("body.id_user", body.id_user);
    if (user_exist.length == 0){
        return handler.returner(
          [false, { message: "User is not found" }],
          api_name,
          404
      ) 
    } else {
        const created_token = await token.create_token(body.id_user)
        const updated_data = {
            id_user: body.id_user,
            user_first_name: body.user_first_name,
            user_last_name: body.user_last_name,
            user_middle_name: body.user_middle_name,
            user_address_shipping: body.user_address_shipping,
            user_password: password_hashed
        };
    
        const update = await db.update_one(
            "users",
            updated_data,  
            "id_user",
            body.id_user
        );
        
        if (update) {
            return handler.returner(
                [true, 
                    { 
                        data: updated_data, 
                        token: created_token,
                        message: "User is updated"
                    }
                ],
                api_name,
                200
            );
        }
    }

}
    