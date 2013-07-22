var os = require('os')
var path = require('path')
var personaID = require('persona-id')
var levelup = require('levelup')

module.exports = function(options) {
  if (typeof options === 'string') options = { audience: options }
  if (!options) options = {}
  if (!options.valueEncoding) options.valueEncoding = 'json'
  if (!options.location) options.location = path.join(os.tmpdir(), 'data.leveldb')
  var db = options.db || levelup(options.location, options)
  
  var persona = personaID(options.audience || 'http://localhost:8080')
  
  persona.on('create', function (sid, profile) {
    db.put(sid, profile, function(err) {
      if (err) console.log('persona save error', sid, err.message)
    })
  })

  persona.on('destroy', function (sid) {
    if (!sid) return
    db.del(sid, function(err) {
      if (err) console.log('persona del error', sid, err.message)
    })
  })
  
  authHandler.db = db
  authHandler.persona = persona
  authHandler.getProfile = getProfile
  
  if (options.devMode) console.error("DOORKNOB IS RUNNING IN DEV MODE!")
  
  return authHandler
  
  function authHandler(req, res, cb) {
    if (options.devMode) return cb (false, {email: "fake@test.com"})
    if (persona.test(req)) {
      persona.handle(req, res)
      cb(false, { loggingIn: true })
      return
    }
    getProfile(req, cb)
  }
  
  function getProfile(req, cb) {
    if (options.devMode) return cb (false, {email: "fake@test.com"})
    var sid = persona.getId(req)
    if (!sid) return cb(false, { loggedOut: true })
    db.get(sid, function(err, profile) {
      if (err) {
        console.log('session does not exist in db:', sid)
        cb(false, {})
        return
      }
      cb (false, profile)
    })
  }
}
