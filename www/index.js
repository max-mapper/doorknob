var request = require('browser-request')
var persona = require('persona-id')()

var identify = document.getElementById('identify')
var unidentify = document.getElementById('unidentify')
var output = document.getElementById('output')

getSession() 

persona.on('login', function(id) { getSession() })

persona.on('logout', function() { getSession() })

identify.addEventListener('click', function () { persona.identify() })

unidentify.addEventListener('click', function () { persona.unidentify() })

function getSession() {
  request({url: '/_profile', json: true}, function(err, resp, profile) {
    if (!persona.id && profile.email) persona.set(profile.email)
    output.innerHTML = JSON.stringify(profile)
  })
}