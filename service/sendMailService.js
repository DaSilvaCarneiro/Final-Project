const nodemailer = require('nodemailer');
require('dotenv').config();

const sendForgotPasswordEmail = async ({ resetPasswordToken, email }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: '"Tiago Carneiro" <tiago.carneiro@example.com>',
      to: email,
      subject: "Reset password requested",
      text: `Reset password token: ${resetPasswordToken}`,
      html: `Reset password token: <b>${resetPasswordToken}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendForgotPasswordEmail,
};