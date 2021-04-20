const mysql = require("mysql");
const connection = require("./connect");
const handler = require("../../middleware/handler");

module.exports = {
  search_one: async (table, column, data) => {
    let result = await connection.query(
      `SELECT * FROM ${table} WHERE ${column} = ?`,
      [data]
    );
    return result;
  },
<<<<<<< HEAD
<<<<<<< HEAD
  search_get_one_column: async (table, column) => {
    let result = await connection.query(`SELECT ${column} FROM ${table}`);
=======
=======
>>>>>>> origin/madhu-order-update
  search_two: async (table, column_one, column_two, data1, data2) => {
    let result = await connection.query(
      `SELECT * FROM ${table} WHERE ${column_one} = ? AND ${column_two} = ?`,
      [data1, data2]
    );
    return result;
  },
<<<<<<< HEAD
  select_oneColumn: async (table, column1, column2, data) => {
    let result = await connection.query(
      `SELECT ${column1} FROM ${table} WHERE ${column2} = ?`,
      [data]
    );
>>>>>>> origin/madhu-login-EmailOrPhoneAndPassword
    return result;
  },

  insert_new: async (data, table) => {
    const result = await connection.query(`INSERT INTO ${table} SET ?`, data);
    return result;
  },

=======
  insert_new: async (data, table) => {
    const result = await connection.query(`INSERT INTO ${table} SET ?`, data);
    return result;
  },

>>>>>>> origin/madhu-order-update
  update_one: async (table, updated_data, column, condition) => {
    const result = await connection.query(
      `UPDATE ${table} SET ? WHERE ${column} = ?`,
      [updated_data, condition]
    );
    return result;
  },
};
