var request = require('browser-request')
var persona = require('persona-id')()

var identify = document.getElementById('identify')
var unidentify = document.getElementById('unidentify')
var profile = document.getElementById('profile')

getSession() 

persona.on('login', function(id) { console.log('login'); getSession() })

persona.on('logout', function() { console.log('logout');  getSession() })

identify.addEventListener('click', function () { persona.identify() })

unidentify.addEventListener('click', function () { persona.unidentify() })

function getSession() {
  request({url: '/_session', json: true}, function(err, resp, profile) {
    if (!persona.id && profile.email) persona.set(profile.email)
    profile.innerHTML = JSON.stringify(profile)
  })
}