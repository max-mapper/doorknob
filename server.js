var createDoorknob = require('./')
var ecstatic = require('ecstatic')
var http = require('http')

var staticHandler = ecstatic('www')
var port = 8080

module.exports = function(host, port) {
  if (!port) {
    port = host
    host = false
  }
  var audience = 'http://' + (host || 'localhost') + ':' + (port || 8080)
  var doorknob = createDoorknob(audience)
  console.log(doorknob)
  http.createServer(function(req, res) {
    doorknob(req, res, function(err, profile) {
      if (profile.loggingIn) return
      if (req.url.match(/^\/_session/)) return sendJSON(res, profile)
      return staticHandler(req, res)
    })
  }).listen(port)
}

function sendJSON(res, obj) {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(obj))
}