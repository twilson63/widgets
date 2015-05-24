require('http').createServer(function(req, res) {
  res.end('OK')
}).listen(process.env.PORT || 4000)

var cfg = require('./package.json').config
var follow = require('follow')

follow({db: [cfg.endpoint, cfg.app].join('/'), include_docs: true, since: 'now'}, function (err, change) {
  if (err) return console.log(err)
  console.log(change.doc)
})
// var bus = require('servicebus').bus({
//   url: cfg.endpoint,
//   vhost: cfg.vhost
// })

// bus.subscribe(cfg.app, function (event) {
//   console.log(event)
// })