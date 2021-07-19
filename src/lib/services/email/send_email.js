// const { SMTPClient } = require("emailjs")
// const handler = require("../../../middleware/handler")

// module.exports = {
//     email: async (user, email) => {
//         const transporter = new SMTPClient({
//             user: "do-not-reply@utopiatech.io",
//             password: "M4Rw*nND",
//             host: "sub5.mail.dreamhost.com",
//             ssl: true,
//         })

//         // send the message and get a callback with an error or details of the message that was sent
//         transporter.send(
//             {
//                 text:
//                     email.message +
//                     "\n\n\n\n\nUtopia Tech PTY LTD\n\nIf you have any questions please contact us via \nAdmin@utopiatech.io",
//                 from: "do-not-reply@utopiatech.io",
//                 to: user,
//                 // cc: "else <else@your-email.com>",
//                 subject: email.subject,
//             },
//             (err, message) => {
//                 if (err) {
//                     return handler.returner([false, error])
//                 } else {
//                     console.log("Email sent: ", message)
//                 }
//             }
//         )
//     },
// }

const nodemailer = require("nodemailer")
const handler = require("../../../middleware/handler")

module.exports = {
    email_result: async (user, email) => {
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport({
                host: "sub5.mail.dreamhost.com",
                // port: 467,
                port: 587,
                secure: false,
                auth: {
                    user: "do-not-reply@utopiatech.io",
                    pass: "M4Rw*nND",
                },
            })
            const mailOptions = {
                from: "do-not-reply@utopiatech.io",
                to: user,
                subject: email.subject,
                text:
                    email.message +
                    "\n\n\n\n\nUtopia Tech PTY LTD\n\nIf you have any questions please contact us via \nAdmin@utopiatech.io",
            }
            let resp = false;

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("error is " + error);
                    
                    resolve(false,error); // or use rejcet(false) but then you will have to handle errors
                }
                else {
                    console.log('Email sent: ' + JSON.stringify(info) );
                    resolve([true, JSON.stringify(info)+"---------------------------------------"+info.response]);
                }
            });
        })

    }
}




//console.log("aaaaaaaaaaaaaa",email_result())

/*
    email: async (user, email) => {
        console.log("trying to send email")
      
        console.log("aaaaaaaaaaaaaa")
       

        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return handler.returner([false, error])
            } else {
                console.log("Email sent: ")

                return handler.returner([true, info])
            }
        })
    },


*/





    







