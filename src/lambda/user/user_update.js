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
    // try {
    //     const body = JSON.parse(event.body)
    //     const id_user = JSON.parse(event.pathParameters.id_user)
    //     //error handling
    //     if (!body || JSON.stringify(body) === "{}") {
    //         throw "body is empty"
    //     }

    //     const all_fields = Object.keys(body)

    //     //more error handling
    //     const required_fields = ["user_first_name", "user_last_name", "user_middle_name", "user_password", "user_address_shipping"]
    //     const missing_fields = required_fields.filter(field => !all_fields.includes(field))

    //     if (missing_fields.length > 0) {
    //         throw Error(missing_fields)
    //     }

    //     const { user_first_name, user_last_name, user_middle_name, user_address_shipping, user_password, ...others } = body
    //     const password_hashed = await passwordHash(user_password)

    //     const user_id = await db.search_one(
    //         "users",
    //         "id_user",
    //         id_user
    //     )

    //     if (user_id.length < 0) {
    //         throw "User is not found"
    //     }

    //     const optional_fields = Object.keys(others)

    //     //checks if id_user_status field is provided
    //     //update new record into user_statuses table,
    //     //returns user_status_id
    //     async function getNewUserStatusId() {
    //         if (others && optional_fields.includes("id_user_status")) {
    //           const { id_user_status } = others
    //           const new_id_user_status = await db.update_one("user_statuses",id_user_status,"id_user_status",id_user_status);
    //           return new_id_user_status.insertId
    //         }
    //     }
    //     //checks if id_user_title field is provided
    //     //update new record into user_title table,
    //     //returns user_title_id
    //     async function getNewUserTitleId() {
    //         if (others && optional_fields.includes("id_user_title")) {
    //           const { id_user_title } = others
    //           const new_id_user_title = await db.update_one("user_title",id_user_title,"id_user_title",id_user_title);
    //           return new_id_user_title.insertId
    //         }
    //     }

    //     //retrieves user_status_id from user_statuses table
    //     const new_user_status_id = await getNewUserStatusId()
    //     //retrieves user_title_id from user_title table
    //     const new_user_title_id = await getNewUserTitleId()
    //     const created_token = await token.create_token(id_user)

    //     async function getUpdatedUserId() {
    //         let new_user_record
    //         if (new_user_status_id && new_user_title_id) {
    //             const updated_data = {
    //                 id_user_status: new_user_status_id,
    //                 id_user_title: new_user_title_id,
    //                 user_first_name,
    //                 user_last_name,
    //                 user_middle_name,
    //                 user_password: password_hashed,
    //                 user_address_shipping
    //             }
    //             new_user_record = await db.update_one(users, updated_data, id_user, id_user);
    //         } else {
    //             const updated_data = {
    //                 user_first_name,
    //                 user_last_name,
    //                 user_middle_name,
    //                 user_password: password_hashed,
    //                 user_address_shipping
    //             }
    //             new_user_record = await db.update_one(users, updated_data, id_user, id_user);
    //         }

    //         return new_user_record.insertId
    //     }

    //     //retrieves user_id from users table
    //     const new_user_id = await getUpdatedUserId()

    //     if (!new_user_id) {
    //         throw "User update unsuccessful"
    //     }

    //     return handler.returner(
    //         [
    //           true,
    //           {
    //             token: created_token,
    //             user_first_name: user_first_name,
    //             user_last_name: user_last_name,
    //             user_middle_name: user_middle_name
    //           },
    //         ],
    //         api_name,
    //         201
    //     )
      
    // } catch (e) {
    //     if (e.name === "Error") {
    //       const errors = e.message
    //         .split(",")
    //         .map(field => {
    //           return `${field} is required`
    //         })
    //         .join(", ")
    
    //       return handler.returner([false, errors], api_name, 400)
    //     }
    //     return handler.returner([false, e], api_name, 400)
    //   }
    // }
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
            user_email,
            user_phone_number,
            id_user_title,
            id_user_status
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