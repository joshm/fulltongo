'use strict';

var Stemmer = require('natural').PorterStemmer
, Metaphone = require('natural').Metaphone
, Mongoose = require('mongoose')
, _ = require('lodash');

module.exports = exports = function fulltongo(schema, options) {
  var fields = options.fields.slice();
  var addSchema = {};
  addSchema['_keywords'] = [String];
  schema.add(addSchema);

  schema.path('_keywords').index(true);

  schema.statics.search = function(query, callback) {
    var words = [];
    Stemmer.tokenizeAndStem(query).forEach(function(word) {
      words.push(Metaphone.process(word));
    });

    return Mongoose.Model.find.call(this, {'_keywords': {$in: words}}, callback);
  };

  //https://github.com/cstigler/mongoose-fts
  schema.statics.indexAll = function(callback) {
    var self = this;

    Mongoose.Model.find.call(this, {}, function(err, docs) {
      if(err) return callback(err, docs);

      var docsToUpdate = docs.length;
      docs.forEach(function(doc) {
        doc.updateIndex();
        doc.save(function(err) {
          if(err) {
            console.warn('error indexing document: ', err);
          }
          if(--docsToUpdate === 0) {
            return callback();
          }
        });
      });
    });
  };

  schema.methods.updateIndex = function() {
    var self = this;
    var values = [];
    var metaPhoneWords = []

    fields.forEach(function(field) {
      var val = self.get(field);
      if(val) {
        var arr = Array.isArray(val) ? val : [val];
        values = values.concat(arr);
      }
    });

    Stemmer.tokenizeAndStem(values.join(' ')).forEach(function(word) {
      metaPhoneWords.push(Metaphone.process(word));
    });

    self.set('_keywords', _.uniq(metaPhoneWords));
  };

  schema.pre('save', function(next) {
    var self = this;
    var changed = this.isNew || fields.some(function (field) {
      return self.isModified(field);
    });

    if(changed) this.updateIndex();

    return next();
  });
};