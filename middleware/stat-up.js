const config = require('config');


module.exports = function () {
   if (!config.get('mail.password')) {
      throw new Error('FATAL ERROR: app pasword is not set')
   }
   console.log(`-Developer: ${config.get('Developer')}`)
   console.log(`-Application Name: ${config.get('name')}`);
   console.log(`-Mail Server: ${config.get('mail.host')}`);
   console.log(`-Mail password: ${config.get('mail.password')}`);
}