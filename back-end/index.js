const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }))

app.use('/login', require('./routes/login'));
app.use('/user', require('./routes/user'));

app.listen(8080, () => {
    console.log(`http://localhost:8080`);
})