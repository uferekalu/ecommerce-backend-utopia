require("dotenv").config()
const nodemailer = require("nodemailer")

let htmlTemplate = (email_info) => {
    return `
                    <div style="width:80%; margin:auto;">
                        <h3 style="text-align:center">${email_info.subject}</h3>
                        <p>Hello ${email_info.user_first_name},</p>
                        <p>${email_info.message}</p>
                        <br />
                        <p>Thank you.</p>
                        <p>The Utopia Team.</p>
                        <br />
                        <div style="background-color:#84d9b3; text-align:center; padding:1rem">
                            <p>If you have any questions please contact us via</p>
                            <br>admin@utopiatech.io</br>
                        </div>
                    </div>
                    `
}

let htmlLiveHelpTemplate = (email_info) => {
    return `
                    <br />
                    <br />
                    <div style="width:80%; margin:auto; font-size:2.5rem">
                        <h3 style="text-align:center">${email_info.subject}</h3>
                        <p>Hello</p>
                        <p>${email_info.user_first_name}${email_info.user_last_name} is requesting a
                            live help ${email_info.user_order_number ? "with an order number "+email_info.user_order_number : ""},
                            please contact him via this email ${email_info.user_phone_number ? "or phone number "+email_info.user_phone_number : ""}
                        </p>
                        <p>${email_info.message}</p>
                        <br />
                        <p>Thank you.</p>
                        <p>The Utopia Team.</p>
                        <br />
                        <div style="background-color:#84d9b3; text-align:center; padding:1rem">
                            <p>If you have any questions please contact us via</p>
                            <br>admin@utopiatech.io</br>
                        </div>
                    </div>
                    `
}

module.exports = {
    email: async (email_info) => {
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
                to: email_info.user_email,
                subject: email_info.subject,
                html: htmlTemplate(email_info),

                text:
                    email_info.message +
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
    liveHelpMail: async (email_info) => {
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
                to: "moezzain94@gmail.com",
                subject: email_info.subject,
                html: htmlLiveHelpTemplate(email_info),
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
