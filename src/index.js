const express = require('express');
const config = require('config');

require('../src/db/mongoose');

const { task_router } = require('../src/routes/task');
const { user_router } = require('../src/routes/user');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(task_router);
app.use(user_router);

const port_value = config.get('NODE_ENV');
const port = process.env.PORT || port_value
app.listen(port, () => { console.log(`Connected: listening on port ${port_value}`) });


