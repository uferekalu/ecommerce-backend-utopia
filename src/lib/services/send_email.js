/*user: 'do-not-reply@utopiatech.io',
    pass: '2pGURgmM'*/

const nodemailer = require('nodemailer');
const handler = require('../../middleware/handler')

module.exports = {
    send_email: async (user, email) => {
         const transporter = nodemailer.createTransport({
            host: 'sub5.mail.dreamhost.com',
            port: 587,
            secure: false,
            auth: {
                user: 'do-not-reply@utopiatech.io',
                pass: 'M4Rw*nND'
            }
        });
        const mailOptions = {
            from: 'do-not-reply@utopiatech.io',
            to: user,
            subject: email.subject,
            text: email.message + "\n\n\n\n\nUtopia Tech PTY LTD\n\nIf you have any questions please contact us via \nAdmin@utopiatech.io"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("Error",error)
                return handler.returner([false, error])
            }else
            console.log("Email sent: ",info)
        });

    }
}
