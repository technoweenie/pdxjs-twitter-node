!SLIDE center

# Let's try something real #

![golfing](golf.jpg)

!SLIDE bullets incremental

# Analyzing Tweets #

* Store tweets in a Redis queue
* Analyze tweets and assign score based on content
* How do we determine tweets are interesting?

!SLIDE javascript smaller

### Receive 'LOST' Tweets from Twitter API ###

    @@@ javascript
    var twit = new TwitterNode({
      user: 'user', 
      password: 'password')

    // use a generic keyword
    twit.track('lost')

    twit
      .addListener('tweet', function(tweet) {

        var json = JSON.stringify(tweet)
        redis.rpush("twitter:stream", json)
      })

      .stream()

!SLIDE javascript smaller

### Receive 'LOST' Tweets from Twitter API ###

    @@@ javascript
    var twit = new TwitterNode({
      user: 'user', 
      password: 'password')


    twit.track('lost')

    twit
      .addListener('tweet', function(tweet) {
        // push tweet to a Redis list
        var json = JSON.stringify(tweet)
        redis.rpush("twitter:stream", json)
      })

      .stream()

!SLIDE javascript smaller

### Accept tweets from specific LOST users ###

    @@@ javascript
    var validUsers = ["damonlindelof", "carltoncuse", "islostonyet", "isbsgonyet", "docarzt"]
    function isValidLOSTUser(tweet) {
      var lowerName = tweet.user.screen_name.toLowerCase()
      return validUsers.indexOf(lowerName) > -1
    }

!SLIDE javascript smaller

### Look for other common LOST-related keywords ###

    @@@ javascript
    var keywordThreshold = 2
    var keywordScores = {"#lost":2, "island":2, "locke":2, "jack":1, "kate":1, "jacob":1, "sayid":2, "richard":1, "smokey":2, "dharma":2}
    function hasValidKeywords(tweet) {
      // break a tweet into an array of words
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

!SLIDE javascript smaller

### Look for other common LOST-related keywords ###

    @@@ javascript
    var keywordThreshold = 2
    var keywordScores = {"#lost":2, "island":2, "locke":2, "jack":1, "kate":1, "jacob":1, "sayid":2, "richard":1, "smokey":2, "dharma":2}
    function hasValidKeywords(tweet) {

      var words = tweet.text.toLowerCase().split(" ")
      var total = 0
      words.forEach(function(w) {
        // remove special chars, unless it is a hash tag
        if(w.substr(0, 1) != '#')
          w = w.replace(/[^\w]+/, '')
        var score = keywordScores[w]

        if(score)
          total = total + score
      })

      return total >= keywordThreshold;
    }

!SLIDE javascript smaller

### Look for other common LOST-related keywords ###

    @@@ javascript
    var keywordThreshold = 2
    var keywordScores = {"#lost":2, "island":2, "locke":2, "jack":1, "kate":1, "jacob":1, "sayid":2, "richard":1, "smokey":2, "dharma":2}
    function hasValidKeywords(tweet) {

      var words = tweet.text.toLowerCase().split(" ")
      var total = 0
      words.forEach(function(w) {

        if(w.substr(0, 1) != '#')
          w = w.replace(/[^\w]+/, '')
        var score = keywordScores[w]
        // add the matching score to the tweet's total
        if(score)
          total = total + score
      })

      return total >= keywordThreshold;
    }

!SLIDE javascript smaller

### Analyze tweets from the Redis queue

    @@@ javascript
    function process() {
      // pop the first item from the Redis list
      redis.lpop("twitter:stream").addCallback(function(json) {
        if(json) {

          processTweet(JSON.parse(json))

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

!SLIDE javascript smaller

### Analyze tweets from the Redis queue

    @@@ javascript
    function process() {

      redis.lpop("twitter:stream").addCallback(function(json) {
        if(json) {
          // if there is a value, analyze the tweet
          processTweet(JSON.parse(json))

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

!SLIDE javascript smaller

### Analyze tweets from the Redis queue

    @@@ javascript
    function process() {

      redis.lpop("twitter:stream").addCallback(function(json) {
        if(json) {

          processTweet(JSON.parse(json))
          // scan for another value in the list
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

!SLIDE javascript smaller

### Analyze tweets from the Redis queue

    @@@ javascript
    function process() {

      redis.lpop("twitter:stream").addCallback(function(json) {
        if(json) {

          processTweet(JSON.parse(json))

          process()
        } else {
          // queue is empty, wait 3 seconds
          setTimeout(process, 3000)
        }
      })
    }

    function processTweet(tweet) {
      if(isValidLOSTUser(tweet) || hasValidKeywords(tweet)) {
        sys.puts("@" + tweet.user.screen_name + ": " + tweet.text)
      }
    }

!SLIDE bullets incremental

# Why does this rock? #

* Separate the tweet streaming concern from the processing
* Run both steps as separate processes, even separate servers
* Analyze tweets in whatever language is best for your task