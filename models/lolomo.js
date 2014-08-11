/**
 * This is a data model for lolomo controller.
 * This reads "data/lolomo.json" file asynchronously and executes the
 * callback function by passing the parsed json data from the file.
 * 
 * @author Manish Ranade
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function IndexModel() {
  
  /**
   * This method reads a json file at given location, and calls a 
   * callback function by passing in the results from file reading operation.
   * 
   * @param {String} - path - Path to lolomo.json file
   * @param {Object} - callback - Callback function to call
   */
  function readJSON(path, callback) {
    fs.readFile(path, function(err, data) {
      var json;
      
      if(err) {
        return callback(err);
      }
      
      try {
        json = JSON.parse(data);
      } catch(err) {
        return callback(err);
      }
      
      return callback(null, json);
      
    });
  }
  
  /**
   * This is a wrapper function to readJSON. It sets the file path
   * and calls readJSON.
   * 
   * @param {Object} - callback - Callback function to call
   */
  function getData(callback) {
    
    var filepath = path.normalize(__dirname + '/../data/lolomo.json');
    readJSON(filepath, callback);
  }
  
  return {
    getData: getData
  };
};