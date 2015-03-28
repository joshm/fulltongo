# fulltongo - simple keyword text search plugin for mongoose


Provides metaphone keyword indexing and search for a schema for [Mongoose](http://mongoosejs.com) documents.
Strongly based on [mongoose-fts](https://github.com/cstigler/mongoose-fts) and [reds](https://github.com/tj/reds)

Options:

  - `fields`: an array of paths you want watched and converted into keywords

Example:

```js
var schema = new Schema({
  name: { first: String, last: String, email: String },
  tags: [String]
});

var opts = {};
opts.fields = ['name.first', 'name.last', 'name.email', 'tags'];

schema.plugin(app, opts);

var Person = mongoose.model('Person', schema);
```


This will introduce a few things to the schemea.

1. Every new save, will reindex the fields provided when this was created under the `_keywords` path.
2. A static `search` method is added that takes a `query` parameter and a `callback`
3. An indexAll method is added (this needs more testing) to index all existing documents in a collection
4. An updateIndex that can be used to update the `_keywords` path as needed.

## Notes
For now have a look at the tests to see how this works.


## Mongoose Version
`>= 2.x`

[LICENSE](https://github.com/joshm/fulltongo/blob/master/LICENSE)




