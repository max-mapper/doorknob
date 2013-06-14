var websocket = require('websocket-stream')
var levelup = require('levelup')
var leveljs = require('level-js')
var sublevel = require('level-sublevel')
var replicate = require('level-replicate')

// window.db = sublevel(levelup('foo', { db: leveljs }))

var socket = websocket('ws://localhost:8181')

socket.on('open', function() {
  console.log('socket open')
  // var server = multilevel.server(db)
  // server.pipe(socket).pipe(server)
})

socket.on('error', function(e) {
  console.log('socket error', e)
})

socket.on('end', function() {
  console.log('socket end')
})