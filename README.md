## Overview

This is a simple Node.js application that uses Express as a underlying framework. This application renders Netflix like page with list of movies. List of movies is divided into various different rows. Row title comes from a language specific .properties file from "locales" directory. Depending upon which "locale" is set for the request, application uses appropriate .properties file. If no locale is passed, it defaults to "en_US".

## Starting the App


* Make sure you have [Node and NPM](http://nodejs.org/download/) installed
* `cd /<installation_dir>/i18n-list-of-movies`
* Run: `npm install`
* Run: `npm start`
* Open: http://localhost:3000/list_of_movies?locale=es_SP

## Structure of Project

### /controllers/lolomo.js

This is a controller for the page. At a high level, this file makes two parallel requests:  first one, that reads movies data from a .json file, and second one that loads all the translated strings into a json object by parsing appropriate .properties file. Once the data is ready, it sends it over to the template to render the page.

### /models/lolomo.js

This serves as a data model for the page. This module exposes `getData` method that retrieves data from `lolomo.json` file.

### /views/

This directory holds all Handlebars templates used in the project. The template that renders the list of movies is `lolomo.hbs`.

### /lib/i18n.js

This is a module that takes care of all the i18n related tasks. It exposes an API that lets you parse .properties file into a json object. Also exposes function such as `getRowTitle`, and `getMovieTitle` that can be registered as a helpers on the templates.

### /public

This directory holds all the static resources such as JS and CSS files.

### /public/javascripts/lolomo.js

This is a client-side JavaScript module that handles the popover functionality when user hovers over the movie image.

### /tasks

This directory holds all the Grunt tasks that get automatically loaded inside `Gruntfile.js`. Currently there is only one (`jshint`) task that is used for checking code quality.

### /data

File that holds all the movie data is stored in this directory.

### /locales

All the .properties files that hold translated strings are in this directory.

### app.js

Application entry point.

## i18n Library

i18n module is written in a way that it can be used in any project independently.
app.js file has calls to `i18n.configure` and `i18n.init`. These two calls initialize the library. We also register two helpers that are used in Handlebars templates for this project. 
For more detailed information about the library and the API, please take look at the comments in `i18n.js` source code.

### i18n.configure

This method lets you set configuration values such as location of the `.properties` files, and `default_locale` that represents default locale value in `<language>_<region>` format.

### i18n.init

This method is a middleware that makes use of the `local` query parameter to set the value of locale. It defaults to "en_US".

### Handlebars Helpers

There are two helpers added: `__get_row_title` and `__get_movie_title`. These helpers are used in the template to get row titles and movie titles. Movie titles are shown when user hovers over a movie image.

## Miscellaneous

### Use of Control Flow Library

This project uses "async" control flow library. There are lot of other options which can serve the same purpose. We can also make use of Promises library such as [Bluebird](https://www.npmjs.org/package/bluebird) for better performance.

### i18n Strings in Client-side Javascript

i18n Strings can be easily made available to the client side Javascript by passing the entire strings object over to template by calling `JSON.stringify` and making it client side Javascript object as a inline Javascript.

### Other Possible Improvements

Main intention of this project is to demonstrate the use of i18n library that has a async API to get translations from .properties files. Following things should be taken care of before its ready for production use.

* JavaScript and CSS minification and creating combo files
* Customized version of Bootstrap to include only required components
* Enable GZipping and proper caching headers