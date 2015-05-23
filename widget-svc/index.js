'use strict'

var PouchDB = require('pouchdb')
var db = new PouchDB('widgets', {db: require('memdown')});
var pf = require('@twilson63/palmetto-fire')
var MODEL = 'widget'

var config = {
  endpoint: 'https://tinylog.firebaseio.com/',
  subscription: {
    subject: ['widget'],
    type: ['request'],
    verb: ['*']
  }
}

pf(config, function (err, ee) {
    if (err) { return console.log(err) }
    
    ee.on(MODEL, 'all','request', function (request) {

      db.allDocs({ include_docs: true, startkey: MODEL, endkey: MODEL + '{}'})
        .then(function (docs) {
          ee.emit(MODEL, 'all', 'response', docs)
        })
    })

    ee.on(MODEL, 'get','request', function (request) {
      db.get(request._id)
        .then(function (doc) {
          ee.emit(MODEL, 'get', 'response', doc)
        })
    })

    // create vendor
    ee.on(MODEL,'create', 'request', function (data) {

      // TODO: validate 
      db.put(data.object, MODEL + '-' + (new Date()).toISOString())
        .then(function (res) {
          console.log('got create and added to db')
          console.log(vendor)
          ee.emit(MODEL, 'create', 'response', res)
        })
        .catch(function (err) {
          ee.emit(MODEL, 'create', 'response', err)
        })
    })

    // update model
    ee.on(MODEL, 'update','request', function (data) {
      db.put(data.object).then(function (res) {
        ee.emit(MODEL, 'update', 'response', res)
      })
      .catch(function (err) {
        ee.emit(MODEL, 'update', 'response', err)
      })
    })

    // ee.on(MODEL, 'remove','request', function (vendor) {
    //   db.remove(vendor).then(function (res) {
    //     ee.emit('vendor', 'remove', 'response', res)
    //   })
    //   .catch(function (err) {
    //     ee.emit('vendor', 'update', 'response', err)
    //   })
    // })
})

require('http').createServer(function (req, res) {
  res.end('OK')
}).listen(process.env.PORT || 3000)