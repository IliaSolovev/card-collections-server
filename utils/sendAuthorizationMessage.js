const nodemailer = require('nodemailer');
const createMessage = require('../email-message-template/createMessage');
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eblo1.eblo1@gmail.com',
    pass: 'AJm3Ujd*uTm[-W?qw'
  }
});

const sendAuthorizationMessage = async (token, email) => {
  const Message = {
    from: "eblo1.eblo1@gmail.com",
    to: email,
    subject: "Message title",
    html: createMessage(token),
  };
  await transporter.sendMail(Message);
}

module.exports = sendAuthorizationMessage