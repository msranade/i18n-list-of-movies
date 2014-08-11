/**
 * This module deals with parsing .properties file and building namespaced strings object that holds translations.
 * Public methods from this module can be used in controller as well as in templates.
 * 
 * Module exposes following methods publicly:
 * 
 *   - configure - (sets the default configurations. This has to be called before init.)
 *   - init -  (used as a middleware to set global configurations that are depenedent on request object)
 *   - getStrings - (parses appropriate .properties file and builds namespaced translated strings object)
 *   - getRowTitle - (returns translated Row title)
 *   - getMovieTitle - (returns translated short title of the movie)
 * 
 * .properties files are under "locale" directory. Naming convention for properties files is: 
 *   <page_name>_<language>_<region>.properties
 * 
 * Fallback Logic:
 * 
 * When the page loads, config.locale is set via init middleware. Using this locale value, 
 * we form the file path and try to look for this file.
 * 
 * For example:
 * If the strings_namespace is "lolomo" and locale is "es_SP" it tries to look up "lolomo_es_SP.properties" file.
 * If its not found, it tries to look for "lolomo_es.properties" file.
 * If thats also not found then it uses "lolomo_en_US.properties" file.
 * 
 * @author Manish Ranade
 * 
 */

'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = (function i18n() {
  
  var config = { 
    'directory': path.normalize(__dirname + '/../locales/'), 
    'default_local': 'en_US' 
  };
  var default_locale;
  var file_name;
  var strings_obj = {};
  
  /**
   * This function sets the value for global variable "file_name"
   * It first tries to find if the file exists by forming a filename by appending
   * strings_namespace with passed in locale with underscore. 
   * 
   * For example: 
   * 
   * if the strings_namespace is "lolomo" and the locale set is "es_SP", it tries to look up "lolomo_es_SP.properties" file.
   * If it doesnt exist, it tries to look up "lolomo_es.properties", if that doesn't exist then it fallsback to
   * "lolomo_en_US.properties" file.
   * 
   * We are using async.parallel method from control flow library "async". Here we start looking for XXXX_<lang>_<region> file and 
   * XXXX_<lang> file at the same time, but wait until we get results from both searches and then take the decision.
   * 
   * @param {Object} - cb - callback function that gets executed after setting the file_name
   */
  function setFileName(cb) {
    
    var locale_parts = config.locale.split('_');
    var lang = locale_parts[0];
    var region = locale_parts[1];
    var default_file_name = config.strings_namespace + '_' + default_locale + '.properties';
    var file_exists = false;
    var first_pref;
    var second_pref;
    var file_to_parse = [config.strings_namespace, lang, region].join('_') + '.properties';
    
    async.parallel([
    
      // start looking for XXXX_<lang>_<region>.properties file.
      // if found, set "first_pref" variable
      function(callback) {
        fs.exists(config.directory + file_to_parse, function(exists) {        
          if(exists) {
            first_pref = file_to_parse;
          }
          
          callback(null, first_pref);
        });
      },
      
      // start looking for XXXX_<lang>.properties file. 
      // if not found then set second_pref to fallback English translations file.
      function(callback) {
        second_pref = [config.strings_namespace, lang].join('_') + '.properties';
        
        fs.exists(config.directory + second_pref, function(exists) { 
          
          if(!exists) {
            second_pref = default_file_name;
          }
          
          callback(null, second_pref);
        });
      }
    ], 
    
    // both the searches are done, now we can take the decision on
    // which file to use.
    function(err, results) {
      
      if(err) {
        file_name = default_file_name;
      }
      else {
        file_name = results[0] ? results[0] : results[1];
      }
      
      cb();
    });
  }
  
  /**
   * This method turns key and value pair into namespaced json object.
   * This object gets merged with strings_obj which is a global variable in this module.
   * 
   * For Example:
   * 
   * if 
   *   key_path = "list.display_name.RecentlyWatchedList"
   *   value = Continue Watching
   * 
   * it merges following into the strings_obj
   * 
   * {
   *   "list": {
   *     "display_name": {
   *       "RecentlyWatchedList": Continue Watching 
   *     }
   *   }
   * }
   * 
   * @param {String} - key_path - translation of this key is to be used in the UI.
   * @param {String} - value - Actual translation of the "key_path"
   * 
   */
  function createNamespacedObj(key_path, value) {

    var keys = key_path.split('.');
    var key;
    var current_obj = strings_obj;
    var last_key;

    for (var i=0; i < keys.length-1; i++) {

      key = keys[i];

      if (typeof current_obj[key] === 'undefined') {
        current_obj[key] = {};
      }

      current_obj = current_obj[key];
    }

    last_key = keys[keys.length-1];
    current_obj[last_key] = value;
  }
  
  /**
   * This function takes raw data from .properties file,
   * takes every key/value pair and turns into json object
   * by calling createNamespacedObj
   * 
   * @param {String} - data - Raw data from .properties file
   * 
   */
  function parse(data) {
    var strings = data.split('\n');
    var key;
    var value;
    var key_val;
    
    // remove empty elements
    strings = strings.filter(function(n){ return n; });
    
    for(var i = 0, len = strings.length; i < len; i++) {
      key_val = strings[i].split('=');
      key = key_val[0];
      value = key_val[1];
      
      createNamespacedObj(key, value);
    } 
  }
  
  /**
   * This function reads the property file asynchronously and 
   * pares the contents by calling "parse" function on it. 
   * 
   * @return {Object} - callback - Callback function to execute after we are done reading the file
   * 
   */
  function parseToJSON(callback) {
    if(!file_name) {
      return {};
    }
    
    fs.readFile(config.directory + file_name, 'utf-8', function(err, data) {
      if(err) {
        return callback(err);
      }
      
      parse(data);
      callback(null, strings_obj);
    });
  }
  
  /**
   * This method is exposed by this module for external use.
   * This is supposed to be called only once when the page loads.
   * This method populates the strings_obj which holds the JSON represenation of
   * the .properties file.
   * 
   * @param {String} - strings_namespace - this is used to lookup the .properties file.
   *                                       for ex: if value is 'lolomo', module will parse 
   *                                       lolomo_<lang>_<region>.properties file
   * @param {Object} - callback - Callback function
   * 
   */
  function getStrings(strings_namespace, callback) {
    
    if(!strings_namespace) {
      return callback(new Error('String namespace is not defined.'));
    }
    
    config.strings_namespace = strings_namespace;
    
    setFileName((function(cb) {
      return function(err, data) {
        parseToJSON(cb);
      };
    }(callback)));
  }
  
  /**
   * This method is exposed by this module for external use. 
   * Template helpers can be created as an alias of this method.
   * Returns the translated row title from the strings_obj.
   * 
   * @param {String} text
   * @return {String} translated row title
   */
  function getRowTitle(text) {
    return strings_obj.list.display_name[text] || text;
  }
  
  /**
   * This method is exposed by this module for external use. 
   * Template helpers can be created as an alias of this method.
   * Returns the translated movie title from the strings_obj.
   * 
   * @param {String} movie_id
   * @return {String} translated movie title
   */
  function getMovieTitle(movie_id) {
    return strings_obj.movies.title_short[movie_id] || '';
  }
  
  /**
   * This function is used as a middleware to set "config.locale" variable
   * for this module. Fallback for locale is "en_US".
   * 
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - next function to call to continue the request flow
   * 
   */
  function init(req, res, next) {
    config.locale = req.query.locale || default_locale;
    next();
  }
  
  /**
   * This function sets configuration options for the module.
   * This should be called in the script which is application entry point.
   * 
   * @param {Object} options
   */
  function configure(options) {
    default_locale = options.default_locale || 'en_US';
    config.directory = path.normalize(options.directory) || path.normalize(__dirname + '/../locales/');
  }
  
  return {
    init: init,
    configure: configure,
    getStrings: getStrings,
    getRowTitle: getRowTitle,
    getMovieTitle: getMovieTitle
  };
}());