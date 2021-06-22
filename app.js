const express = require('express');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const validator = require('express-validator');
const flash = require('connect-flash');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/authentication');
const MySQLStore = require('express-mysql-session')(session);


// Initializations
const app = express();
const { database } = require('./config');
require('./lib/passport');

 
// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('$D%^%H8ZstUeeb!xweY5'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.TOKEN_SECRET || '$D%^%H8ZstUeeb!xweY5',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
  }));
app.use(flash());

app.use((req, res, next) => {
    app.locals.message = req.flash('message');
    app.locals.success = req.flash('success');
    app.locals.user = req.user;
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Error handler 
app.use((req, res, next) => {
    res.status(404).sendFile('error404.html', {root: path.join(__dirname, 'public/landingPageAdmin')});
    console.log(`${req.ip} tried to access ${req.originalUrl}`)
});

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


module.exports = app;



