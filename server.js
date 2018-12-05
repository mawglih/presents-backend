const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const podarki = require('./routes/api/podarki');

const app = express();

//cors
const allowedOrigins = [
  'http://localhost:3000',
];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

//Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//DB
const db = require('./config/key').mongoURI;
mongoose
  .connect(db)
  .then(() => console.log('MongoDb connected'))
  .catch(err => console.log(err));

//Passport middleware

app.use(passport.initialize());
require('./config/passport')(passport);

//routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/podarki', podarki);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));