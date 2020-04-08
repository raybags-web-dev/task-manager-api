const sgMail = require('@sendgrid/mail');
const config = require('config');
const { async_errors } = require('../../middleware/errorHandler');

const send_grid_api_key = config.get('mail.sendGrid_api_key');

sgMail.setApiKey(send_grid_api_key);

const send_welcome_email = async_errors((email, firstName) => {
   sgMail.send({
      to: email,
      from: 'baguma.github@gmail.com',
      subject: `Hi and welcome!`,
      text: `Hello ${firstName}, thanks for trying out our app. When you get the time, please let us know how you are finding the app and or what we could do better.`
   });
})

const send_unsubscribe_email = async_errors((email, firstName) => {
   sgMail.send({
      to: email,
      from: 'baguma.github@gmail.com',
      subject: `You have successfully unsubscribed!`,
      text: `Hi ${firstName}, its sad to see you go. Its unfortunate we didn't exceed your expectations. Rest assured we are working on it. Please let us know what and or how we could have done better.`
   });
})

const send_user_profileUpdate_email = async_errors((email, firstName) => {
   sgMail.send({
      to: email,
      from: 'baguma.github@gmail.com',
      subject: `You account has successfully been updated!`,
      text: `Hi ${firstName}, your changes have been saved successfully.`
   });
})

module.exports = {
   send_welcome_email,
   send_unsubscribe_email,
   send_user_profileUpdate_email
}