var sys = require('sys')
var TwitterNode = require('./lib').TwitterNode
// you can pass args to create() or set them on the TwitterNode instance
var twit = new TwitterNode({
  user: 'user', 
  password: 'password',
  track: ['lost']})

twit
  .addListener('tweet', function(tweet) {
    sys.puts("@" + tweet.user.screen_name + ": " + tweet.text)
  })

  .addListener('close', function(resp) {
    sys.puts("wave goodbye... " + resp.statusCode)
  })

  .stream()
