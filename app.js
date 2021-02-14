const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const uploadRoutes = require('./data/upload_image');

var cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'uploaded_files')))
app.use(express.static(path.join(__dirname, 'public')));
uploadRoutes(app);
app.set('port', 4401);

app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('port')}.`);
});