const mysql = require("mysql");
const connection = require('./db_connection')
const handler = require('../../middleware/handler')

module.exports = {

    search_email: async (email) => {
        let result = await connection.query('SELECT * FROM users WHERE user_email = ?', [email])
        return result

    },

    search_id : async(id)=>{  
        let result = await connection.query('SELECT * FROM users WHERE id_user = ?', [id])
        return result
    },

    insert_new: async (data, table) => {
        const result =  await connection.query(`INSERT INTO ${table} SET ?`, data ) 
        return result
    },

    update_one : async(data, table ,id)=>{
        const result =  await connection.query(`UPDATE ${table} SET ? WHERE id_user = ?`, [data, id ]) 
        return result
    }


}