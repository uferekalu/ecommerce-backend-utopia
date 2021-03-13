let empolyees = [
  {
    token: "123dfrdv450",
    first_name: "Ali",
    last_name: "Ahmed",
    email: "ali124@gmail.com",
    phone: "54789045645",
    salary: 12000,
  },
  {
    token: "5ergvfd7580",
    first_name: "Sara",
    last_name: "Saad",
    email: "sara128@gmail.com",
    phone: "54878621075",
    salary: 17000,
  },
  {
    token: "123sefvd450",
    first_name: "Mohammad",
    last_name: "Wael",
    email: "moh170@gmail.com",
    phone: "48786305437",
    salary: 20000,
  },
];
const parser = require("body-parser-for-serverless");

exports.handler = async function (event) {
  event = await parser(event);

  console.log(event);
  //if no Token
  if (!event) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "missing your token in body" }),
    };
  }

  let { token } = event;
  var res = null;
  empolyees.some((element) => {
    //console.log("element ", element);
    // console.log("Received ", token);
    // console.log("user token ", element.token);

    if (element.token.toString() == token.toString()) {
      //  console.log("found");
      res = {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        api: "get user's first and last name",
        body: JSON.stringify({
          data: {
            first_name: element.first_name,
            last_name: element.last_name,
          },
        }),
      };
    }
  });
  if (res == null) {
    return {
      statusCode: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "User that belongs to token is not found",
      }),
    };
  } else {
    return res;
  }
};
