var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var should = require('should');
var fs = require('fs');
var app = require('../');
var Person, person1, urls;
var profiles = [];

mongoose.connect('localhost', 'mongoose_fulltongo');

describe('plugin', function() {

  before(function(done) {
    mongoose.connection.on('open', function() {
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
      }
      return done();
    });
  });

  describe('indexing tests', function() {
    var schema, Profile
    before(function(done) {
      schema = new Schema({
        name: { first: String, last: String},
        email: [String]
      });

      Profile = mongoose.model('Profile', schema);

      data = fs.readFileSync(__dirname + '/data', 'utf8').split('\n')
      var stopAt = data.length-1;
      data.forEach(function(dp) {
        var dataFields = dp.split(' ');
        if(dataFields.length === 3) {
          var p = new Profile({name: {last: dataFields[1], first: dataFields[0]}, email: dataFields[2]});
          p.save(function(err, p) {
            should.not.exist(err);
            profiles.push(p);
            if(--stopAt === 0) {
              /*
              var opts = {};
              opts.fields = ['name.first', 'name.last', 'email'];

              schema.plugin(app, opts);
              */

              return done();
            }
          })
        }
      });
    })

    it('should index all', function(done) {
      delete mongoose.connection.models['Profile'];
      schema = new Schema({
        name: { first: String, last: String},
        email: [String]
      });

      var opts = {};
      opts.fields = ['name.first', 'name.last', 'email'];
      schema.plugin(app, opts);
      Profile = mongoose.model('Profile', schema);

      Profile.indexAll(function(err, result) {
        Profile.find({}, function(err, items) {
          items.forEach(function(p) {
            p._keywords.length.should.eql(5);
          })
          done();
        })
      })
    })
  })

  describe('general tests', function() {
    before(function (done) {
      var schema = new Schema({
        name: { first: String, last: String},
        email: [String]
      });

      var opts = {};
      opts.fields = ['name.first', 'name.last', 'email'];

      schema.plugin(app, opts);

      Person = mongoose.model('Person', schema);
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
      }
      done();
    });

    it('should create a _keywords property', function(done) {
      should.exist(Person.schema.paths._keywords);
      done();
    })

    it('should have an indexAll static method', function(done) {
      should.exist(Person.schema.statics.indexAll);
      done();
    });

    it('should have an search static method', function(done) {
      should.exist(Person.schema.statics.search);
      done();
    });

    it('should populate the keywords for name', function(done) {
      var p = new Person({name: {last: 'foo', first: 'bar'}, email: 'foo@example.com'});
      p.updateIndex();
      p._keywords.length.should.eql(4);
      p.save(function(err, p) {
        should.not.exist(err);
        person1 = p;
        done();
      })
    })

    it('should search for foo', function(done) {
      Person.search('foo hound', function(err, items) {
        should.not.exist(err);
        items.length.should.eql(1);
        done();
      });
    })

  })



  after(function(){
    mongoose.connection.close()
  })
})