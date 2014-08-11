/**
 * This is the application entry point.
 */

'use strict';

var express = require('express');
var path = require('path');
var lolomo = require('./controllers/lolomo');
var expressHbs = require('express3-handlebars');
var i18n = require('./lib/i18n');

var app = express();

// Serve static content from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Setting up Handlebars templates configurations.
// Here we are also adding two i18n related helpers (__get_row_title and __get_movie_title)
// that are used in the templates.
var hbs = expressHbs.create({
  extname:'hbs', 
  defaultLayout:'main.hbs',
  helpers: {
    '__get_row_title': function () {
      return i18n.getRowTitle.apply(this, arguments);
    },
    
    '__get_movie_title': function () {
      return i18n.getMovieTitle.apply(this, arguments);
    }
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');


// Initializing i18n library by calling 'configure' and 'init' methods.

// Set the defaults that define where the .properties files are and
// what should be the fallback locale.
i18n.configure({
  directory: __dirname + '/locales/',
  default_locale: 'en_US'
});

// init acts as a middleware. It grabs the 'locale' request variable and
// sets the value of config.locale in the library.
app.use(i18n.init);

app.use('/', lolomo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}); 

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message : err.message,
      error : err, 
      is_production: false
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    is_production: true
  });
});

module.exports = app;
