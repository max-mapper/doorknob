var os = require('os')
var path = require('path')
var personaID = require('persona-id')
var level = require('level')
var sublevel = require('level-sublevel')

module.exports = function(options) {
  if (typeof options === 'string') options = { audience: options }
  if (!options) options = {}
  if (!options.valueEncoding) options.valueEncoding = 'json'
  if (!options.location) options.location = path.join(os.tmpdir(), 'data.leveldb')
  var db = options.db || level(options.location, options)
  db = sublevel(db)
  
  var profiles = db.sublevel('profiles')
  var sessions = db.sublevel('sessions')
  
  var persona = personaID(options.audience || 'http://localhost:9966')
  
  persona.on('create', function (sid, meta) {
    var profile = {email: meta.email}
    sessions.put(sid, JSON.stringify(meta), function(err) {
      if (err) console.log('sessions save error', sid, err.message)
    })
    profiles.get(profile.email, function(err, existingProfile) {
      profiles.put(profile.email, existingProfile || JSON.stringify(profile), function(err) {
        if (err) console.log('persona save error', profile.email, err.message)
      })
    })
  })

  persona.on('destroy', function (sid) {
    if (!sid) return
    sessions.del(sid, function(err) {
      if (err) console.log('session del error', sid, err.message)
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
    var expiredError = { loggedOut: true, sessionExpired: true }
    var sid = persona.getId(req)
    if (!sid) return cb(false, { loggedOut: true })
    sessions.get(sid, function(err, meta) {
      if (err) return cb(false, expiredError)
      var pmeta = JSON.parse(meta)
      profiles.get(pmeta.email, function(err, profile) {
        if (err) return cb(false, expiredError)
        cb (false, JSON.parse(profile))
      })
    })
  }
}
