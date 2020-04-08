const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../src/models/userModel');

exports.auth = async function auth(req, res, next) {
   try {

      const token = req.header('Authorization').replace('Bearer ', '')
      const decoded = jwt.verify(token, config.get('mail.secret_key'))
      const user = await User.User.findOne({ _id: decoded._id, 'tokens.token': token })

      req.user = token;
      req.user = user

      next()

   } catch (error) {
      res.status(401).send(`Error:Authentication failed`);
      console.error('user not logged in')
   }
}