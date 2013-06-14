var createDoorknob = require('./')
var ecstatic = require('ecstatic')
var http = require('http')

var staticHandler = ecstatic('www')
var port = 9966

module.exports = function(host, port) {
  if (!port) {
    port = host
    host = false
  }
  var audience = 'http://' + (host || 'localhost') + ':' + (port || 9966)
  var server = http.createServer(function(req, res) {
    server.doorknob(req, res, function(err, profile) {
      if (profile.loggingIn) return
      if (req.url.match(/^\/_session/)) return sendJSON(res, profile)
      return staticHandler(req, res)
    })
  }).listen(port)
  server.doorknob = createDoorknob(audience)
  return server
}

function sendJSON(res, obj) {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(obj))
}