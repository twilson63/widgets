var http = require('http')
var ecstatic = require('ecstatic')

var server = http.createServer(ecstatic('public'))
var io = require('socket.io')(server)

server.listen(process.env.PORT || 9966)

var palmetto = require('@twilson63/palmetto-couchdb')
var config = require('./package.json').config
var ee = palmetto(config)

io.on('connection', function (socket) {
  socket.on('send', function (msg) {
    ee.on(msg.from, function (res) {
      socket.emit(res.to, res)
    })
    ee.emit('send', msg)
  })
})