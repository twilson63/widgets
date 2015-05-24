var http = require('http')
var ecstatic = require('ecstatic')

var server = http.createServer(ecstatic('public'))
var io = require('socket.io')(server)

server.listen(process.env.PORT || 9966)

var palmetto = require('@twilson63/palmetto-rmq')
var config = {
  endpoint: 'amqp://rajztapw:XM2DnCXtrALDZbbNwEw8TCYjTjCitHb7@owl.rmq.cloudamqp.com',
  vhost: 'rajztapw',
  app: 'widgets'
}
var ee = palmetto(config)

io.on('connection', function (socket) {
  console.log('connected')
  socket.on('send', function (msg) {
    console.log(msg)
    ee.on(msg.res, function (res) {
      console.log(res)
      socket.emit(res.id, res)
    })
    ee.emit('send', msg)
  })
})