const mysql = require("mysql")
const connection = require("./connect")
const handler = require("../../middleware/handler")

module.exports = {
    search_one: async (table, column, data) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ${column} = ?`, [data])
        return result
    },

    select_columns_with_condictions: async (columns, table, column, data) => {
        let result = await connection.query(
            `SELECT ${columns.join(", ")} FROM ${table} WHERE ${column} = ?`,
            [data]
        )
        return result
    },

    /**
     * @desc Returns one record from a table by condition
     * @query SELECT * FROM table WHERE condition
     */
    select_one: async (table, condition) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ?`, [condition])
        return result
    },

    select_one_with_2conditions: async (table, condition1, condition2) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ? AND ?`, [
            condition1,
            condition2,
        ])
        return result
    },
    select_one_from_join3_with_2conditions: async (
        table1,
        table2,
        table3,
        joint1,
        joint2,
        condition1
        // condition2
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2}=${table3}.${joint2} WHERE ${table1}.${joint1}=${condition1}`
        )
        return result
    },

    select_all: async (table) => {
        let result = await connection.query(`SELECT * FROM ${table}`)
        return result
    },

    select_many: async (table, columns) => {
        let result = await connection.query(`SELECT ${columns.join(", ")} FROM ${table}`)
        return result
    },

    select_many_from_join_with_condition: async (table1, table2, joint, columns, condition) => {
        let result = await connection.query(
            `SELECT ${columns.join(
                ", "
            )} FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint} WHERE ?`,
            [condition]
        )
        return result
    },

    select_all_from_join: async (table1, table2, joint) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint}`
        )
        return result
    },

    select_all_from_join3: async (table1, table2, table3, joint1, joint2) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2}`
        )
        return result
    },

    select_all_from_join_with_condition: async (table1, table2, joint, condition) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint} WHERE ?`,
            [condition]
        )
        return result
    },
    aaron_select_all_from_join_with_condition: async (
        table1,
        table2,
        joint,
        condition1,
        condition2
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint} WHERE ${condition1} = ${condition2}`
        )
        return result
    },

    select_all_from_join3_with_condition: async (
        table1,
        table2,
        table3,
        joint1,
        joint2,
        condition
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} WHERE ?`,
            [condition]
        )
        return result
    },
    select_all_from_join3_with_2condition: async (
        table1,
        table2,
        table3,
        joint1,
        joint2,
        condition1,
        condition2
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table2}.${joint2} = ${table3}.${joint2} WHERE ? AND ?`,
            [condition1, condition2]
        )
        return result
    },

    select_all_from_join2_with_condition: async (table1, table2, joint1, condition, order_by) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} WHERE ${table2}.${joint1} < ? ORDER BY ${order_by}`,
            [condition]
        )
        return result
    },

    select_all_from_join3_with_condition_and_order: async (
        table1,
        table2,
        table3,
        joint1,
        joint2,
        condition,
        order_by
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} WHERE ? ORDER BY ${order_by} DESC`,
            [condition]
        )
        return result
    },

    select_all_from_join4: async (table1, table2, table3, table4, joint1, joint2, joint3) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3}`
        )
        return result
    },

    select_all_from_join4_with_is_active_condition: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3} WHERE ${table2}.is_active = 1`
        )
        return result
    },
    select_all_from_join4_with_condition: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3} WHERE ?`,
            [condition]
        )
        return result
    },
    select_all_from_join4_with_conditionB: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table3}.${joint3} = ${table4}.${joint3} WHERE ?`,
            [condition]
        )
        return result
    },
    select_all_from_join5_with_conditionB_and_order: async (
        table1,
        table2,
        table3,
        table4,
        table5,
        joint1,
        joint2,
        joint3,
        joint4,
        condition,
        order_by,
        dir
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table3}.${joint3} = ${table4}.${joint3} JOIN ${table5} ON ${table2}.${joint4} = ${table5}.${joint4} WHERE ? ORDER BY ${order_by} ${dir}`,
            [condition]
        )
        return result
    },
    select_all_from_join4_with_condition_and_order: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition,
        order_by,
        dir
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3} WHERE ? ORDER BY ${order_by} ${dir}`,
            [condition]
        )
        return result
    },

    select_all_from_join4_with_condition_order_and_limit: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition,
        order_by,
        lim,
        dir
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3} WHERE ? ORDER BY ${order_by} ${dir} LIMIT ${lim}`,
            [condition]
        )
        return result
    },

    select_all_from_join4_with_condition_and_order: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition,
        order_by,
        dir
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3} ORDER BY ${table1}.${order_by} ${dir}`,
            [condition]
        )
        return result
    },
    select_all_from_join4_with_condition_and_orderB: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition,
        order_by,
        dir
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table3}.${joint3} = ${table4}.${joint3} WHERE ? ORDER BY ${table2}.${order_by} ${dir}`,
            [condition]
        )
        return result
    },
    select_all_from_join4_with_condition_and_order_and_limit: async (
        table1,
        table2,
        table3,
        table4,
        joint1,
        joint2,
        joint3,
        condition,
        order_by,
        lim,
        dir
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} JOIN ${table4} ON ${table2}.${joint3} = ${table4}.${joint3} ORDER BY ${table1}.${order_by} ${dir} LIMIT ${lim}`,
            [condition]
        )
        return result
    },

    select_all_from_join3: async (table1, table2, table3, joint1, joint2) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2}`
        )
        return result
    },

    select_all_from_join_with_regex: async (table1, table2, joint, target, regex) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint} WHERE ${target} REGEXP ?`,
            [regex]
        )
        return result
    },

    select_all_from_join3_with_regex: async (
        table1,
        table2,
        table3,
        joint1,
        joint2,
        target,
        regex
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} WHERE ${target} REGEXP ?`,
            [regex]
        )
        return result
    },

    select_all_from_join_with_condition_and_regex: async (
        table1,
        table2,
        joint,
        condition,
        target,
        regex
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint} WHERE ? AND ${target} REGEXP ?`,
            [condition, regex]
        )
        return result
    },

    select_all_from_join3_with_condition_and_regex: async (
        table1,
        table2,
        table3,
        joint1,
        joint2,
        condition,
        target,
        regex
    ) => {
        let result = await connection.query(
            `SELECT * FROM ${table1} JOIN ${table2} ON ${table1}.${joint1} = ${table2}.${joint1} JOIN ${table3} ON ${table1}.${joint2} = ${table3}.${joint2} WHERE ? AND ${target} REGEXP ?`,
            [condition, regex]
        )
        return result
    },

    select_many_from_join_with_condition_and_regex: async (
        table1,
        table2,
        joint,
        columns,
        condition,
        target,
        regex
    ) => {
        let result = await connection.query(
            `SELECT ${columns.join(
                ", "
            )} FROM ${table1} JOIN ${table2} ON ${table1}.${joint} = ${table2}.${joint} WHERE ? AND ${target} REGEXP ?`,
            [condition, regex]
        )
        return result
    },

    select_all_with_condition: async (table, condition) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ?`, [condition])
        return result
    },

    select_one_with_condition: async (table, column, condition) => {
        let result = await connection.query(
            `SELECT ${column} FROM ${table} WHERE ? ORDER BY ${column}`,
            [condition]
        )
        return result
    },

    select_many_with_condition: async (table, columns, condition) => {
        let result = await connection.query(
            `SELECT ${columns.join(", ")} FROM ${table} WHERE ? ORDER BY ${columns[0]}`,
            [condition]
        )
        return result
    },

    /**
     * @desc Returns one column from a table with condition and orders
     * @query SELECT target FROM table WHERE condition ORDER BY order_by dir
     */
    select_one_with_condition_and_order: async (table, target, condition, order_by, dir) => {
        let result = await connection.query(
            `SELECT ${target} FROM ${table} WHERE ? ORDER BY ${order_by} ${dir}`,
            [condition]
        )
        return result
    },
    select_all_with_condition_and_order: async (table, column, condition, dir) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ? ORDER BY ${column} ${dir}`,
            [condition]
        )
        return result
    },

    select_all_with_condition_order_and_limit: async (table, column, condition, lim, dir) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ? ORDER BY ${column} ${dir} LIMIT ${lim}`,
            [condition]
        )
        return result
    },

    select_all_and_order: async (table, column, dir) => {
        let result = await connection.query(`SELECT * FROM ${table} ORDER BY ${column} ${dir}`)
        return result
    },

    select_and_limit: async (table, column, index, lim) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ${column} > ${index} ORDER BY ${column} LIMIT ${lim}`
        )
        return result
    },

    select_with_condition_and_limit: async (table, column, condition, index, lim) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ? AND ${column} > ? ORDER BY ${column} LIMIT ?`,
            [condition, index, lim]
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

    select_many_with_condition_and_limit: async (table, columns, condition, index, lim) => {
        let result = await connection.query(
            `SELECT ${columns.join(", ")} FROM ${table} WHERE ? AND ${columns[0]} > ? ORDER BY ${
                columns[1]
            } LIMIT ?`,
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

    select_with_regex: async (table, column, data) => {
        let result = await connection.query(`SELECT * FROM ${table} WHERE ${column} REGEXP ?`, [
            data,
        ])
        return result
    },

    select_with_regex_and_limit: async (table, sort, target, regex, limit) => {
        let result = await connection.query(
            `SELECT * FROM ${table} WHERE ${target} REGEXP ? AND ${sort} > ? LIMIT ?`,
            [regex, sort, limit]
        )
        return result
    },

    select_many_with_regex_and_limit: async (table, columns, target, regex, limit) => {
        let result = await connection.query(
            `SELECT ${columns.join(", ")} FROM ${table} WHERE ${target} REGEXP ? AND ${
                columns[0]
            } > ? LIMIT ?`,
            [regex, limit]
        )
        return result
    },

    select_one_with_condition_regex_and_limit: async (
        table,
        target,
        condition,
        column,
        regex,
        index,
        lim
    ) => {
        const result = await connection.query(
            `SELECT ${target} FROM ${table} WHERE ? AND ${column} REGEXP ? AND ${target} > ? ORDER BY ${target} LIMIT ?`,
            [condition, regex, index, lim]
        )

        return result
    },

    select_one_with_regex_and_limit: async (table, target, column, regex) => {
        const result = await connection.query(
            `SELECT ${target} FROM ${table} WHERE ${column} REGEXP ?`,
            [regex]
        )

        return result
    },

    select_sum_of_1column_1condition: async (table, column, condition) => {
        let result = await connection.query(`SELECT sum(${column}) AS total FROM ${table} WHERE?`, [
            condition,
        ])
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

    delete_with_condition: async (table, condition) => {
        const result = await connection.query(`DELETE FROM ${table} WHERE ?`, condition)
        return result
    },

    update_one: async (table, updated_data, column, condition) => {
        const result = await connection.query(`UPDATE ${table} SET ? WHERE ${column} = ?`, [
            updated_data,
            condition,
        ])
        return result
    },

    /**
     * @desc Updates one record in a table by condition
     * @query UPDATE table SET update WHERE condition
     */
    update_with_condition: async (table, update, condition) => {
        // const result = await connection.query(`UPDATE products_m2m_vendors SET p2v_price= '99' WHERE id_product_m2m_vendor = 302`)
        const result = await connection.query(`UPDATE ${table} SET ? WHERE ?`, [update, condition])
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

    select_one_with_condition_regex: async (table, target, condition, column, regex) => {
        const result = await connection.query(
            `SELECT ${target} FROM ${table} WHERE ? AND ${column} REGEXP ? ORDER BY ${target}`,
            [condition, regex]
        )
        return result
    },

    check_connections: async (USER, COMMAND) => {
        const result = await connection.query(
            `SELECT * FROM INFORMATION_SCHEMA.PROCESSLIST WHERE ? AND ?`,
            [USER, COMMAND]
        )
        return result
    },

    kill_connections: async (ID) => {
        const result = await connection.query(`KILL ${ID}`)
        return result
    },
}
