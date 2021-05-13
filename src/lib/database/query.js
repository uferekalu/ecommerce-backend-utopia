const mysql = require("mysql")
const connection = require("./connect")
const handler = require("../../middleware/handler")

module.exports = {
    search_one: async (table, column, data) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ${column} = ?`, [data])
        return result
    },

    select_and_limit: async (table, column, index, lim) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ${column} > ${index} ORDER BY ${column} LIMIT ${lim}`
        )
        return result
    },

    select_one_with_condition_and_limit: async (table, column, condition, index, lim) => {
        let result = await connection.query(
            `SELECT ${column} FROM ${table} WHERE ? AND ${column} > ? ORDER BY ${column} LIMIT ?`,
            [condition, index, lim]
        )
        return result
    },

    search_get_one_column: async (table, column) => {
        let result = await connection.query(`SELECT ${column} FROM ${table}`)
        return result
    },
    search_two: async (table, column_one, column_two, data1, data2) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ${column_one} = ? AND ${column_two} = ?`,
            [data1, data2]
        )
        return result
    },

    search_two_Or: async (table, column_one, column_two, data1, data2) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ${column_one} = ? OR ${column_two} = ?`,

            [data1, data2]
        )
        return result
    },

    select_oneColumn: async (table, column1, column2, data) => {
        let result = await connection.query(
            `SELECT ${column1} FROM ${table} WHERE ${column2} = ?`,
            [data]
        )

        return result
    },

    search_with_regexp: async (table, column, data) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ${column} REGEXP ?`, [
            data,
        ])
        return result
    },

    select_many_with_regex_and_limit: async (table, columns, target, regex, limit) => {
        let result = await connection.query(
            `SELECT ${columns.join(", ")} FROM ${table} WHERE ${target} REGEXP ? LIMIT ?`,
            [regex, limit]
        )
        return result
    },

    search_with_regexp_compound: async (table, column, data) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ${column} REGEXP ?`, [
            data,
        ])
        return result
    },

    search_with_regexp_compound_and: async (table, column1, data1, condition) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ${column1} REGEXP ? AND ?`,
            [data1, condition]
        )
        return result
    },

    insert_new: async (data, table) => {
        const result = await connection.query(`INSERT INTO ${table} SET ?`, data)
        return result
    },

    search_get_one_column_oncondition: async (table, column1, column2, data) => {
        let result = await connection.query(
            `SELECT ${column1} FROM ${table} WHERE ${column2} = ?`,
            [data]
        )
        return result
    },

    delete_all: async (table) => {
        const result = await connection.query(`DELETE FROM ${table}`)
        return result
    },
    delete_one: async (table, column, data) => {
        const result = await connection.query(`DELETE FROM ${table} WHERE ${column} = ?`, data)
        return result
    },

    update_one: async (table, updated_data, column, condition) => {
        const result = await connection.query(`UPDATE ${table} SET ? WHERE ${column} = ?`, [
            updated_data,
            condition,
        ])
        return result
    },

    insert_many: async (values, columns, table) => {
        let attr
        if (columns.length === 1) {
            attr = columns.join()
        }
        if (columns.length > 1) {
            attr = columns.join(", ")
        }
        const result = await connection.query(`INSERT INTO ${table} (${attr}) VALUES ?`, [values])
        return result
    },

    join_two_tables: async (tableOne, tableTwo, condition, columns) => {
        const result = await connection.query(
            `SELECT ${columns.join(
                ", "
            )} FROM ${tableOne} JOIN ${tableTwo} ON ${tableOne}.${condition}=${tableTwo}.${condition}`
        )
        return result
    },

    insert_new_on_condition: async (data, table, column) => {
        const result = await connection.query(`INSERT INTO ${table} SET ? WHERE ${column} =?`, data)
        return result
    },
}
