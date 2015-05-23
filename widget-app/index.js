var pf = require('@twilson63/palmetto-fire')
var svr = null

pf({
  endpoint: 'https://tinylog.firebaseio.com/',
  subscription: {
    subject: ['widget'],
    verb: ['*'],
    type: ['response']
  },
  sequence: 'now'
}, function (err, ee) {
  svr = ee
})


require('angular').module('app', [])
  .factory('widgets', function () {
    return {
      all: function (cb) {
        var received = false
        // if server does not return in 1 sec then default to empty set
        // setTimeout(function() { 
        //   if (!received) {
        //     received = true
        //     cb(null, []) 
        //   }
        // }, 1000)

        svr.on('widget', 'all', 'response', function (res) {
          console.log('beep')
          if (received) return
          if (res.object && res.object.rows) {
            var widgets = res.object.rows.map(function (r) { return r.doc })
            cb(null, widgets)    
          } else {
            console.log(res)
            cb(null)
          }
        })
        svr.emit('widget', 'all', 'request', {})

      },
      create: function (widget, cb) {
        svr.on('widget', 'create', 'response', function (resp) {
          cb(resp.object)
        })
        svr.emit('widget', 'create', 'request', widget)
      }
    }
  })
  .controller('AppController', function ($scope, widgets) {
    function reload() {
      console.log('reload - start')
      widgets.all(function (err, widgets) {
        console.log('reload called')
        if (err) alert(err.message)
        $scope.$apply(function () {
          $scope.widgets = widgets 
        })
      })
    }
    //$scope.widgets = []

    $scope.add = function (widget) {
      widgets.create(widget, function (res) {
        reload()
      })
      $scope.widget = null
    }
    widgets.all(function (err, widgets) {
      console.log('reload called')
      if (err) alert(err.message)
      $scope.$apply(function () {
        $scope.widgets = widgets 
      })
    }) 
    setTimeout(reload, 500)
  })


var domify = require('domify')
var h = require('hyperscript')
document.body.appendChild(
  domify(
    render().outerHTML
  )
)

function render() {
  return h('div', { 'data-ng-app': 'app' }, [
    h('div', { 'data-ng-controller': 'AppController'}, [
      h('h1', 'Widgets'),
      h('form', {'data-ng-submit': 'add(widget)'}, [
        h('input', { 'data-ng-model': 'widget.name'})
      ]),
      h('ul', [
        h('li', { 'data-ng-repeat': 'widget in widgets'}, '{{widget.name}}')
      ])
    ])
  ])
}
