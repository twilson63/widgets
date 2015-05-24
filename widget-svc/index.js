'use strict'
var MODEL = 'widget'

var PouchDB = require('pouchdb')
var db = new PouchDB('widgets', {db: require('memdown')});

// use rabbitmq adapter
var pc = require('@twilson63/palmetto-rmq')
// create core
var io = pc(require('./package.json').config)

// all widgets
io.on([MODEL, 'request', 'all'].join('/'), function (event) {
  var VERB = 'all'
  db.allDocs({ include_docs: true, startkey: MODEL, endkey: MODEL + '{}'})
    .then(function (docs) {
      // send response
      io.emit('send', {
        to: event.from,
        subject: MODEL,
        verb: VERB,
        type: 'response',
        object: docs
      })
    })
})

// get one widget by id
io.on([MODEL,'request','get'].join('/'), function (event) {
  var VERB = 'get'

  db.get(event.object._id)
    .then(function (doc) {
      // send response
      io.emit('send', {
        to: event.from,
        subject: MODEL,
        verb: VERB,
        type: 'response',
        object: doc
      })
    })
})

    // create widget
io.on([MODEL,'request', 'create'].join('/'), function (event) {
  var VERB = 'create'
  // TODO: validate 
  db.put(event.object, MODEL + '-' + (new Date()).toISOString())
    .then(function (res) {
      console.log('got create and added to db')
      console.log(data)
      // send response
      io.emit('send', {
        to: event.from,
        subject: MODEL,
        verb: VERB,
        type: 'response',
        object: res
      })
    })
    .catch(function (err) {
      io.emit('send', {
        to: event.from,
        subject: MODEL,
        verb: VERB,
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
}).listen(process.env.PORT || 3001)