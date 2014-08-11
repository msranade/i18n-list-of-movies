/**
 * This is a controller that loads "/list_of_movies" page. 
 * The associated template is: views/lolomo.hbs
 * 
 * Control flow library "async" is used here. We use async.parallel method to 
 * start of following tasks in parallel:
 *   - Use lolomo Model class to retrieve movies data from "data/lolomo.json" file
 *   - Use i18n module to populate the translations from "lolomo_<lang>_<region>.properties"
 * 
 * When both the tasks are complete, we pass on the data to the template to render.
 * 
 * @author Manish Ranade
 *  
 */

'use strict';

var express = require('express');
var async = require('async');
var lolomoModel = require('../models/lolomo');
var i18n = require('../lib/i18n');

var router = express.Router();
var model = new lolomoModel();
var content = {};


router.get('/list_of_movies', function(req, res) {
  async.parallel([
    
    // parse lolomo.json file to populate movie data 
    function(callback) {
      model.getData(function(err, data) {
        
        if(err) {
          return callback(err);
        }
        
        handleModelData(err, data, callback);
      });
    },
    
    // parse appropriate .properties file to populate
    // the required translations. We are passing "lolomo"
    // as a namespace to lookup properties file.
    // it will look for "lolomo_<lang>_<region>.properties"
    function(callback) {
      i18n.getStrings('lolomo', function(err, data) {
        
        if(err) {
          return callback(err);
        }
        
        content.strings = data;
        callback();
      });
    }
  ], 
  
  // When both the above tasks are done,
  // pass the control to the template along with the data to render.
  function(err, results) {
    
    if(err) {
      res.render('error');
      return;
    }
    else {
      res.render('lolomo', { 
        'page_content': content.template_data
      });
    }
  });
});

/**
 * This function mainly does data massaging before we pass the data to the template.
 * lolomo.json has lot of detailed movie data and we dont need all of that to render the page.
 * So here we are just simplifying the data structure so that its easy to iterate over in the tempalte.
 * 
 * @param {Object} - err - Error object
 * @param {Object} - data - Data returned after reading lolomo.json file
 * @param {Object} - callback - Callback function
 * 
 */
function handleModelData(err, data, callback) {
  
  if(err) {
    return callback(err);
  }
  
  var lists = data.lists;
  var movies = data.movies;
  var template_data = [];
  var row;
  var row_movies;
  var i;
  
  for(i in lists) {
    row = {};
    row.title = lists[i].summary.key;
    row_movies = lists[i].movies;
    row.movies = [];
    
    for(var j = 0, len = row_movies.length; j < len; j++) {
      row.movies.push({
        'id': movies[row_movies[j]].summary.id,
        'box_art_150x214': movies[row_movies[j]].summary.box_art['150x214'],
        'box_art_350x197': movies[row_movies[j]].summary.box_art['350x197']
      });      
    }
    
    template_data.push(row);
  }
  
  content.template_data = template_data;
  callback();  
}

module.exports = router;
