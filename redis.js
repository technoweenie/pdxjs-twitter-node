var sys         = require('sys'),
    TwitterNode = require('./lib').TwitterNode,
    redisClient = require('redisclient'),
          redis = new redisClient.Client()

// you can pass args to create() or set them on the TwitterNode instance
var twit = new TwitterNode({
  user: 'user', 
  password: 'password',
  track: ['lost']})

twit
  .addListener('tweet', function(tweet) {
    var json = JSON.stringify(tweet)
    redis.rpush("twitter:stream", json)
  })

  .addListener('close', function(resp) {
    sys.puts("wave goodbye... " + resp.statusCode)
  })

  .stream()

var validUsers = ["damonlindelof", "carltoncuse", "islostonyet", "isbsgonyet", "docarzt"]
function isValidLOSTUser(tweet) {
  var lowerName = tweet.user.screen_name.toLowerCase()
  return validUsers.indexOf(lowerName) > -1
}

var keywordThreshold = 2
var keywordScores = {"#lost":2, "island":2, "locke":2, "jack":1, "kate":1, "jacob":1, "sayid":2, "richard":1, "smokey":2, "dharma":2}
function hasValidKeywords(tweet) {
  var words = tweet.text.toLowerCase().split(" ")
  var total = 0
  words.forEach(function(w) {
    if(w.substr(0, 1) != '#')
      w = w.replace(/[^\w]+/, '')
    var score = keywordScores[w]
    if(score)
      total = total + score
  })
  return total >= keywordThreshold;
}

function process() {
  redis.lpop("twitter:stream").addCallback(function(json) {
    if(json) {
      var tweet = JSON.parse(json)
      processTweet(tweet)
      process()
    } else {
      setTimeout(process, 3000)
    }
  })
}

function processTweet(tweet) {
  if(isValidLOSTUser(tweet) || hasValidKeywords(tweet)) {
    sys.puts("@" + tweet.user.screen_name + ": " + tweet.text)
  }
}

process()