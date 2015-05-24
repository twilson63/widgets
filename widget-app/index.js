var io = require('socket.io-client')
console.log(window.location.href)
var socket = io(window.location.href)

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

        socket.on(['widget', 'response', 'all'].join('/'), function (res) {
          //console.log(res)
          //if (received) return
          if (res.object && res.object.rows) {
            var widgets = res.object.rows.map(function (r) { return r.doc })
            cb(null, widgets)    
          } else {
            console.log(res)
            cb(null)
          }
        })
        socket.emit('send', {
          id: 'widget/request/all',
          res: 'widget/response/all',
          subject: 'widget',
          type: 'request',
          verb: 'all',
          object: {}
        })

      },
      create: function (widget, cb) {
        socket.on(['widget', 'response', 'create'].join('/'), function (resp) {
          cb(resp.object)
        })
        socket.emit('send', {
          id: 'widget/request/create',
          res: 'widget/response/create',
          subject: 'widget',
          type: 'request',
          verb: 'create',
          object: widget
        })
      }
    }
  })
  .controller('AppController', function ($scope, widgets) {
    function reload() {
      //console.log('reload - start')
      widgets.all(function (err, widgets) {
        //console.log('reload called')
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
    // widgets.all(function (err, widgets) {
    //   console.log('reload called')
    //   if (err) alert(err.message)
    //   $scope.$apply(function () {
    //     $scope.widgets = widgets 
    //   })
    // }) 
    socket.once('connect', function() {
      //console.log('connected')
      reload()
    })
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
