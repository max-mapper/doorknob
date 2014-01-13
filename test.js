require('./server')({audience: 'localhost:9966'}).listen(9966, function() {
  console.log('listening on 9966')
})
