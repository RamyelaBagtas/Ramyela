// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER='seasavor0@gmail.com',
    pass: process.env.EMAIL_PASS='ylob wdck xxdd xknv' // Use the app password here if using 2FA
  }
});

const sendApprovalEmail = async (email, firstName, lastName, userType, userId) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Approval Notification',
    text: `Good Day ${firstName} ${lastName}! \n\nYour request for ${userType} account has been approved. In addition, just add .consumer to your registered email to acccess the page for consumers. Thank you! \n Note: disregard this if your user type is Supplier or Seller.`
  };

  await transporter.sendMail(mailOptions);
};

const sendRejectionEmail = async (email, firstName, lastName, userType, reasons, comment) => {
  let reasonText = 'Unfortunately, your request for an account has been rejected for the following reasons:\n';
  if (reasons.dti) reasonText += '- Invalid DTI\n';
  if (reasons.businessPermit) reasonText += '- Invalid Business Permit\n';
  if (reasons.sanitaryPermit) reasonText += '- Invalid Sanitary Permit\n';
  
  if (comment) reasonText += `\nAdditional Comments:\n${comment}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Rejection Notification',
    text: `Good Day, ${firstName} ${lastName}!\n\n${reasonText}\n\nPlease make sure to address the issues and try again.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendApprovalEmail, sendRejectionEmail };