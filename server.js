var createDoorknob = require('./')
var ecstatic = require('ecstatic')
var http = require('http')

var port = 9966

module.exports = function(opts) {
  if (!opts) opts = {}
  if (!opts.host) opts.host = 'localhost'
  if (!opts.port) opts.port = 9966
  if (!opts.staticPath) opts.staticPath = 'www'
  var staticHandler = ecstatic(opts.staticPath)
  
  var audience = 'http://' + opts.host + ':' + opts.port
  var server = http.createServer(function(req, res) {
    server.doorknob(req, res, function(err, profile) {
      if (profile.loggingIn) return
      if (req.url.match(/^\/_session/)) return sendJSON(res, profile)
      if (opts.onRequest) {
        opts.onRequest(req, res, function(handled) {
          // if onRequest handler cb returns false serve static
          if (!handled) staticHandler(req, res)
        })
      } else {
        // serve static if no custom onRequest handler exists
        staticHandler(req, res)
      }
    })
  }).listen(opts.port)
  server.doorknob = createDoorknob(opts)
  return server
}

function sendJSON(res, obj) {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(obj))
}