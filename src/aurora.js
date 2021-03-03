'use strict';

// Require and initialize outside of your main handler
const mysql = require('serverless-mysql')({
    config: {
      database: process.env.DB_NAME,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT
    }
});

// const dbConn = require('serverless-mysql') ({
//     config : {
//         database: "testapp",
//         host: "database-1.cmj8spxpnzjj.us-east-2.rds.amazonaws.com",
//         port:3306,
//         password: "password",
//         user: "admin"

//     }
// });


let Employee = employee => {
    this.first_name     = employee.first_name;
    this.last_name      = employee.last_name;
    this.email          = employee.email;
    this.phone          = employee.phone;
    this.organization   = employee.organization;
    this.designation    = employee.designation;
    this.salary         = employee.salary;
    this.status         = employee.status ? employee.status : 1;
    this.created_at     = new Date();
    this.updated_at     = new Date();
  };
  
  
  Employee.findAll = async function(event, context ) {
      let results = mysql.query("SELECT * FROM employees");
      console.log(results);
      await mysql.end();
      return results;
  };
  

exports.query = async (event, context) => {
    // Get your query
    const data = event.body ? JSON.parse(event.body) : {};
    console.log(data);
    // Run your query
    const [result1] = await Promise.all([Employee.findAll()]);
    //let dataresult = Object.values(JSON.parse(JSON.stringify(result1)));
    console.log(result1)
    // Return the results
    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(
          {
            message: result1
          },
          null,
          2
        ),
      };
};




