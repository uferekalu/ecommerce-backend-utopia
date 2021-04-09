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
  search_get_one_column_oncondition: async (table, column1, column2, data) => {
    let result = await connection.query(
      `SELECT ${column1} FROM ${table} WHERE ${column2} = ?`,
      [data]
    );
    return result;
  },

  insert_new: async (data, table) => {
    const result = await connection.query(`INSERT INTO ${table} SET ?`, data);
    return result;
  },

  update_one: async (table, updated_data, column, condition) => {
    const result = await connection.query(
      `UPDATE ${table} SET ? WHERE ${column} = ?`,
      [updated_data, condition]
    );
    return result;
  },
};
