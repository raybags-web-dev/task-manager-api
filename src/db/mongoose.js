const config = require('config')
const mongoose = require('mongoose');

module.exports = mongoose.connect(config.get('mail.db_connection_string'), {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false
})
   .then(() => { console.log('Connected to mongodDB...') })
   .catch((error) => { console.error('DB Error: Could not connected to database!!'), error.message });

