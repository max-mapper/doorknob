# doorknob

Convenience module for adding Mozilla Persona user login + LevelDB based session storage to node web apps.

[![NPM](https://nodei.co/npm/doorknob.png)](https://nodei.co/npm/doorknob/)

Uses [levelup](http://github.com/rvagg/node-levelup) for storing sessions and [Mozilla Persona](https://login.persona.org/about) (via the [persona-id](http://github.com/substack/persona-id) module) for user sign-on.

There are two main goals for this project:

- Don't be tied to any specific web framework
- Make it as easy as possible to spin up new web apps that users can log in to

## Get it on npm

```
npm install doorknob
```

## Test it out locally

1. clone this repo
2. npm install
3. npm test
4. open localhost:9966

## API

### Require + make an instance

```js
var doorknob = require('doorknob')(audience || options)
```

Returns a function that you can use to authenticate requests and responses, e.g. `function(req, res) {}`

Default options:

```js
{
  valueEncoding: 'json',
  location: path.join(os.tmpdir(), 'data.leveldb'),
  db: levelup(options.location, options),
  audience: 'http://localhost:8080',
  devMode: false // used to develop offline, returns a fake session
}
```

- If you just pass a string as the only argument it has to be the persona audience URL (default is http://localhost:8080)
- Options gets passed to the levelup constructor internally
- You can also pass in your own levelup instance (or technically anything with the same API) via `options.db`
- After initializing, `doorknob.db` is the levelup instance (or the db object you passed in)

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

## using the built in server

There is a default server that uses `http` from node core to handle the basic functionality. It will create a doorknob instance for you and mount it in front of a static file server. You'll want to specify in your own front-end assets (via the `staticPath` option), but you can check out the working (but unstyled) `www/` folder in this repo for an example.

```js
var createServer = require('doorknob/server')
```

Then create a server with some optional options, here are the defaults:

```js
var server = createServer({
  host: 'localhost',
  port: 9966,
  staticPath: 'www',
  onRequest: false
})
```

`server` is an `http.Server` instance with the `doorknob` instance available as `server.doorknob`.

`onRequest` is a function that gets passed `(req, res, profile, callback)`. You must call the callback with either `true` if you handled the request and nothing else should happen or `false` if you want the server to try to serve a static file for the request.

```js
var server = createServer({
  onRequest: function(req, res, profile, cb) {
    if (req.path.match('foo')) {
      res.statusCode(200)
      res.end('bar')
      cb(true)
    } else {
      cb(false)
    }
  }
})
```

Additionally you can `GET /_profile` to retrieve the current user profile.

## license

BSD
