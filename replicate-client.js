var websocket = require('websocket-stream')
var levelup = require('levelup')
var leveljs = require('level-js')
var sublevel = require('level-sublevel')
var replicate = require('level-replicate')

window.db = sublevel(levelup('foo', { db: leveljs }))
var master = replicate(db)
var socket = websocket('ws://localhost:8181')

socket.on('open', function() {
  console.log('socket open')
  socket.pipe(master.createStream({tail: true})).pipe(socket)
  socket.on('data', function(c) {
    console.log(c)
  })
})

socket.on('error', function(e) {
  console.log('socket error', e)
})

socket.on('end', function() {
  console.log('socket end')
})