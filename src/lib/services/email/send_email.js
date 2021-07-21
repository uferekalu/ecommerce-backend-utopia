require("dotenv").config()
const nodemailer = require("nodemailer")
const handler = require("../../../middleware/handler")

module.exports = {
    email: async (user, email) => {
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport({
                host: "sub5.mail.dreamhost.com",
                // port: 467,
                port: 587,
                secure: false,
                auth: {
                    user: "do-not-reply@utopiatech.io",
                    pass: process.env.EMAIL_PASS,
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
            let resp = false

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("error is " + error)

                    resolve(false, error) // or use rejcet(false) but then you will have to handle errors
                } else {
                    console.log("Email sent: " + JSON.stringify(info))
                    resolve([
                        true,
                        JSON.stringify(info) +
                            "---------------------------------------" +
                            info.response,
                    ])
                }
            })
        })
    },
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
