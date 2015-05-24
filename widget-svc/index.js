'use strict'

var PouchDB = require('pouchdb')
var db = new PouchDB('widgets', {db: require('memdown')});
var pc = require('@twilson63/palmetto-rmq')
var MODEL = 'widget'

var config = {
  endpoint: 'amqp://rajztapw:XM2DnCXtrALDZbbNwEw8TCYjTjCitHb7@owl.rmq.cloudamqp.com',
  vhost: 'rajztapw',
  app: 'widgets',
  subscription: {
    subject: ['widget'],
    type: ['request'],
    verb: ['*']
  }
}

var ee = pc(config)


ee.on([MODEL, 'request', 'all'].join('/'), function (request) {
  console.log(request)
  var VERB = 'all'
  db.allDocs({ include_docs: true, startkey: MODEL, endkey: MODEL + '{}'})
    .then(function (docs) {
      ee.emit('send', {
        id: [MODEL, 'response', VERB].join('/'),
        subject: MODEL,
        verb: VERB,
        type: 'response',
        object: docs
      })
    })
})

ee.on([MODEL,'request','get'].join('/'), function (request) {
  var VERB = 'get'
  db.get(request._id)
    .then(function (doc) {
      ee.emit('send', {
        id: [MODEL, 'response', VERB].join('/'),
        subject: MODEL,
        verb: VERB,
        type: 'response',
        object: doc
      })
    })
})

    // create vendor
ee.on([MODEL,'request', 'create'].join('/'), function (data) {
  var VERB = 'create'
  // TODO: validate 
  db.put(data.object, MODEL + '-' + (new Date()).toISOString())
    .then(function (res) {
      console.log('got create and added to db')
      console.log(data)
      ee.emit('send', {
        id: [MODEL, 'response', VERB].join('/'),
        subject: MODEL,
        verb: VERB,
        type: 'response',
        object: res
      })
    })
    .catch(function (err) {
      ee.emit('send', {
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