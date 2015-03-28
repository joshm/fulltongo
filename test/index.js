var mongoose = require('mongoose')
var Schema = mongoose.Schema
var should = require('should')
var app = require('../')
var person1

mongoose.connect('localhost', 'mongoose_fulltongo');

var schema = new Schema({
  name: { first: String, last: String, email: String },
  tags: [String]
});

var opts = {};
opts.fields = ['name.first', 'name.last', 'name.email', 'tags'];

schema.plugin(app, opts);

var Person = mongoose.model('Person', schema);

describe('plugin', function() {
  before(function (done) {
    mongoose.connection.on('open', function() {
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
      }
      return done();
    });
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
    var p = new Person({name: {last: 'foo', first: 'bar', email: 'foo@example.com'}});
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

  //TODO: setup complex keyword search and setup indexing scenario
  after(function(){
    mongoose.connection.close()
  })
})