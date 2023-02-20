const nodemailer = require("nodemailer");

const sendemail = async (email, subject, text) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
              clientId: process.env.OAUTH_CLIENTID,
              clientSecret: process.env.OAUTH_CLIENT_SECRET,
              refreshToken: process.env.OAUTH_REFRESH_TOKEN
            }
          });
        
          let mailoptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: subject,
            text: text
          }

          transporter.sendMail(mailoptions, function(err, data) {
                if (err) {
                  console.log("Error " + err);
                } else {
                  console.log("Email sent successfully");
                }
              });
};

module.exports = sendemail;
