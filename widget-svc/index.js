'use strict'

var PouchDB = require('pouchdb')
var db = new PouchDB('widgets', {db: require('memdown')});
var pc = require('@twilson63/palmetto-couchdb')
var MODEL = 'widget'

var config = {
  endpoint: 'https://tinylog.iriscouch.com/tinylog',
  since: 'now',
  subscription: {
    subject: ['widget'],
    type: ['request'],
    verb: ['*']
  }
}

var ee = pc(config)


ee.on([MODEL, 'all','request'].join('/'), function (request) {

  db.allDocs({ include_docs: true, startkey: MODEL, endkey: MODEL + '{}'})
    .then(function (docs) {
      ee.emit('send', {
        subject: MODEL,
        verb: 'all',
        type: 'response',
        object: docs
      })
    })
})

ee.on([MODEL, 'get','request'].join('/'), function (request) {
  db.get(request._id)
    .then(function (doc) {
      ee.emit('send', {
        subject: MODEL,
        verb: 'get',
        type: 'response',
        object: doc
      })
    })
})

    // create vendor
ee.on([MODEL,'create', 'request'].join('/'), function (data) {
  // TODO: validate 
  db.put(data.object, MODEL + '-' + (new Date()).toISOString())
    .then(function (res) {
      console.log('got create and added to db')
      console.log(vendor)
      ee.emit('send', {
        subject: MODEL,
        verb: 'create',
        type: 'response',
        object: res
      })
    })
    .catch(function (err) {
      ee.emit('send', {
        subject: MODEL,
        verb: 'create',
        type: 'response',
        object: err
      })
    })
})

    // // update model
    // ee.on(MODEL, 'update','request', function (data) {
    //   db.put(data.object).then(function (res) {
    //     ee.emit(MODEL, 'update', 'response', res)
    //   })
    //   .catch(function (err) {
    //     ee.emit(MODEL, 'update', 'response', err)
    //   })
    // })

    // ee.on(MODEL, 'remove','request', function (vendor) {
    //   db.remove(vendor).then(function (res) {
    //     ee.emit('vendor', 'remove', 'response', res)
    //   })
    //   .catch(function (err) {
    //     ee.emit('vendor', 'update', 'response', err)
    //   })
    // })


require('http').createServer(function (req, res) {
  res.end('OK')
}).listen(process.env.PORT || 3000)