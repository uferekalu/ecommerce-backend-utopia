require("dotenv").config()
const nodemailer = require("nodemailer")

module.exports = {
    email: async (user, email) => {
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport({
                host: "sub5.mail.dreamhost.com",
                // port: 467,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_ADDRESS,
                    pass: process.env.EMAIL_PASS,
                },
            })
            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
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
