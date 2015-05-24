require('http').createServer(function(req, res) {
  res.end('OK')
}).listen(process.env.PORT || 4000)

var cfg = require('./package.json').config
var bus = require('servicebus').bus({
  url: cfg.endpoint,
  vhost: cfg.vhost
})

bus.subscribe(cfg.app, function (event) {
  console.log(event)
})