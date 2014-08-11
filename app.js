var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var lolomo = require('./controllers/lolomo');
var expressHbs = require('express3-handlebars');
var i18n = require('./lib/i18n');

var app = express();

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

i18n.configure({
  directory: __dirname + '/locales/',
  default_locale: 'en_US'
});

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
      error : err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message : err.message,
    error : {}
  });
});

module.exports = app;
