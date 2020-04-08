const sharp = require('sharp');
const _ = require('underscore');
const multer = require('multer')

const { mult_upload_error } = require('../../middleware/multer_error');
const { multer_obj } = require('../../middleware/multer_obj');
const { send_welcome_email, send_unsubscribe_email, send_user_profileUpdate_email } = require('../emails/account');

const express = require('express');
const router = express.Router();

const { User } = require('../models/userModel');
const { auth } = require('../../middleware/auth');
const { async_errors } = require('../../middleware/errorHandler');


router.get('/users/me', auth, async_errors(async (req, res) => {
   if (req.user == null) return res.status(200).send('This profile could not be found');
   res.send(req.user)

}));

router.post('/users/login', async_errors(async (req, res) => {

   const userAccount = await User.findOne({ email: req.body.email });
   if (!userAccount) return res.status(400).send('this user account could not be found');

   const user = await User.findByCredentials(req.body.email, req.body.password);
   const token = await user.generateAuthToken();

   res.send({ user, token });
}));

router.post('/users/logout', auth, async_errors(async (req, res) => {
   if (req.user == null) return res.status('400').send('user could not be found!')
   req.user.tokens = req.user.tokens
      .filter(userToken => userToken.token !== req.token);

   await req.user.save();
   res.status(200).send(`You've successfully logged out`);
}));

router.post('/users/logout_all', auth, async_errors(async (req, res) => {
   req.user.tokens = [];

   await req.user.save();
   res.status(200).send(`loggedout successful`);

}))

router.post('/users', async_errors(async (req, res) => {
   let user = await User.findOne({ email: req.body.email });

   if (user) return res.status(409).send('user already exists');
   if (!req.body) return res.status(404).send('You must provide parameters');

   user = new User(_.pick(req.body, ['first_name', 'last_name', 'email', 'phone', 'password', 'isAdmin', 'age']));
   await user.save();

   send_welcome_email(user.email, user.first_name);

   const token = await user.generateAuthToken();

   res.status(201).send({ user, token });
}));

// uploading images
const upload = multer(multer_obj);
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
   if (req.user == null) return res.status(404).send('unauthorized!');

   const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200 })
      .png()
      .toBuffer();

   req.user.avatar = buffer;

   await req.user.save();

   res.send('image successfully uploaded');

}, mult_upload_error);

router.delete('/users/me/avatar', auth, async (req, res) => {
   if (req.user == null) return res.status(400).send('user image could not be found');

   req.user.avatar = undefined;
   await req.user.save();

   res.status(200).send('images deleted.');
});

router.get('/users/:id/avatar', async_errors(async (req, res) => {
   const user = await User.findById(req.params.id)

   if (!user || !user.avatar) throw new Error();

   res.set('Content-Type', 'image/png');
   res.send(user.avatar);
}))

router.put('/users/me', auth, async_errors(async (req, res) => {

   const updates = Object.keys(req.body);
   const allowedupdates = ['first_name', 'last_name', 'email', 'password', 'isAdmin', 'phone', 'age'];
   const isValidUpdates = updates.every((update) => allowedupdates.includes(update));
   if (!isValidUpdates) return res.status(400).send('Error: Invalid user update fields detected!');

   let user = await req.user;
   if (!user) return res.status(404).send(`user could not be found!`);

   allowedupdates.forEach(update => user[update] = req.body[update]);

   await user.save();

   send_user_profileUpdate_email(req.user.email, req.user.first_name);

   res.send(user);

}));

router.delete('/users/me', auth, async_errors(async (req, res) => {
   if (req.user == null) return res.status(200).send('This profile could not be found');

   await req.user.remove();
   send_unsubscribe_email(req.user.email, req.user.first_name)

   res.status(202).send({
      user: {
         account_holder: `${req.user.first_name}`,
         message: `Deleted, Operation successful!`
      }
   });

}));

exports.user_router = router;

