# doorknob

convenience module for adding Mozilla Persona user login + LevelDB based session storage to node web apps

Uses [levelup](http://github.com/rvagg/node-levelup) for storing sessions and [Mozilla Persona](https://login.persona.org/about) (via the [persona-id](http://github.com/substack/persona-id) module) for user sign-on.

## get it on npm

```
npm install doorknob
```

## test it out locally

1. clone this repo
2. npm install
3. npm test
4. open localhost:8080

## API

### require + make an instance

```js
var doorknob = require('doorknob')(audience || options)
```

returns a function that you can use to authenticate requests and responses, e.g. `function(req, res) {}`

arguments:

- if you just pass a string it has to be the persona audience URL (default is http://localhost:8080)
- options gets passed to the levelup constructor internally
- by default `valueEncoding` is set to `json` but you can override that
- you can also pass in your own levelup instance (or technically anything with the same API) via `options.db`
- after initializing, `doorknob.db` is the levelup instance (or the db object you passed in)

### handle a request/response

```js
require('http').createServer(function(req, res) {
  doorknob(req, res, function(err, profile) {
    if (profile.loggingIn) // the request has been handled by persona
    if (profile.email) // the user is logged in
    else // the user is not logged in
  })
}).listen(8080)
```

## license

BSD