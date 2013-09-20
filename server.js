var createDoorknob = require('./')
var ecstatic = require('ecstatic')
var http = require('http')
var corser = require("corser")

var port = 9966

module.exports = function(opts) {
  if (!opts) opts = {}
  if (!opts.host) opts.host = 'localhost'
  if (!opts.port) opts.port = 9966
  if (!opts.staticPath) opts.staticPath = 'www'
  if (!opts.whitelist) opts.whitelist = []
  
  var staticHandler = ecstatic(opts.staticPath)
  var doorknob = createDoorknob(opts)
  opts.whitelist.push(doorknob.persona.audience)
  var cors = corser.create({ origins: opts.whitelist, supportsCredentials: true })
  
  var server = http.createServer(function(req, res) {
    cors(req, res, function() {
       server.doorknob(req, res, function(err, profile) {
         if (err) return
         handler(req, res, profile)
       })
    })
  })
  
  function handler(req, res, profile) {
    if (profile.loggingIn) return
    if (req.url.match(/^\/_profile/)) return sendJSON(res, profile)
    if (opts.onRequest) {
      opts.onRequest = opts.onRequest.bind(server)
      opts.onRequest(req, res, profile, function(handled) {
        // if onRequest handler cb returns false serve static
        if (!handled) staticHandler(req, res)
      })
    } else {
      // serve static if no custom onRequest handler exists
      staticHandler(req, res)
    }
  }

  server.doorknob = doorknob
  return server
}

function sendJSON(res, obj) {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(obj))
}
