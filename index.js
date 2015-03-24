'use strict';

var Stemmer = require('natural').PorterStemmer,
, Mongoose = require('mongoose')
, _ = require('lodash')

module.exports = function(schema, options) {
  schema.statics.search = function(query, callback) {
  }

}