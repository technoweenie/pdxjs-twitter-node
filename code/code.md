!SLIDE center

# Tweet Shouter! #

<div style="text-align:center">
<object width="425" height="344"><param name="movie" value="http://www.youtube.com/v/e_0ZP6Hf1Q8&amp;hl=en_US&amp;fs=1&amp;rel=0"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/e_0ZP6Hf1Q8&amp;hl=en_US&amp;fs=1&amp;rel=0" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="344"></embed></object>
</div>

!SLIDE bullets incremental

# What does it do? #

* Fetch tweets from http stream
* Parse JSON into objects
* Execute `say` command

!SLIDE javascript smaller

# Attempt #1 #

    @@@ javascript
    // pseudo code, contrived example
    var client = http.createClient()
    var data   = client.get("http://stream.twitter.com/1/statuses/filter.json")
    var tweets = JSON.parse(data)
    for(var tweet in tweets)
      sys.exec("say " + tweet.text)

!SLIDE bullets incremental

# What's Wrong? #

* Not asynchronous
* Closes HTTP connection
* Requires Twitter Stream API knowledge
* No encapsulation, hard codes 'say' command

!SLIDE javascript smaller

# Attempt #2 #

    @@@ javascript
    var client = http.createClient(80, 'stream.twitter.com');
    var req    = client.request("GET", "/1/statuses/filter.json")

    req.finish(function(resp) {
      resp.setBodyEncoding("utf8");
      resp.addListener('body', function(chunk) {

        var tweet = JSON.parse(chunk)
        sys.exec("say " + tweet.text)

      });
    })

!SLIDE javascript smaller

# Attempt #2 #

    @@@ javascript
    var client = http.createClient(80, 'stream.twitter.com');
    var req    = client.request("GET", "/1/statuses/filter.json")
    // listen for 'finish' event on http request
    req.finish(function(resp) {
      resp.setBodyEncoding("utf8");
      resp.addListener('body', function(chunk) {

        var tweet = JSON.parse(chunk)
        sys.exec("say " + tweet.text)

      });
    })

!SLIDE javascript smaller

# Attempt #2 #

    @@@ javascript
    var client = http.createClient(80, 'stream.twitter.com');
    var req    = client.request("GET", "/1/statuses/filter.json")

    req.finish(function(resp) {
      resp.setBodyEncoding("utf8");
      resp.addListener('body', function(chunk) {
        // listen for streamed json chunks
        var tweet = JSON.parse(chunk)
        sys.exec("say " + tweet.text)

      });
    })

!SLIDE bullets incremental

# What's Wrong? #

* <s>Not asynchronous</s>
* <s>Closes HTTP connection</s>
* Requires Twitter Stream API knowledge
* No encapsulation, hard codes 'say' command

!SLIDE javascript smaller

# Attempt #3 #

    @@@ javascript
    // store Twitter Stream API options
    var TwitterNode = exports.TwitterNode = function(options) {
      if(!options) options = {}
      this.port          = options.port   || 80
      this.host          = options.host   || 'stream.twitter.com'
      ...

!SLIDE javascript smaller

# Attempt #3 #

    @@@ javascript
    TwitterNode.prototype.stream = function(callback) {
      // configure http client from stored API options.
      var client = this.createClient(this.port, this.host),
         headers = process.mixin({}, this.headers),
            node = this
      headers['Host'] = this.host
      if (this.user)
        headers['Authorization'] = this.basicAuth(this.user, this.password)

      client.request("GET", this.requestUrl(), headers)
        .finish(function(resp) {
          resp.setBodyEncoding("utf8");
          resp.addListener('body', function(chunk) {
            
            callback(JSON.parse(chunk))

          })
        })

!SLIDE javascript smaller

# Attempt #3 #

    @@@ javascript
    TwitterNode.prototype.stream = function(callback) {

      var client = this.createClient(this.port, this.host),
         headers = process.mixin({}, this.headers),
            node = this
      headers['Host'] = this.host
      if (this.user)
        headers['Authorization'] = this.basicAuth(this.user, this.password)
      // sets up client request
      client.request("GET", this.requestUrl(), headers)
        .finish(function(resp) {
          resp.setBodyEncoding("utf8");
          resp.addListener('body', function(chunk) {
            
            callback(JSON.parse(chunk))

          })
        })

!SLIDE javascript smaller

# Attempt #3 #

    @@@ javascript
    TwitterNode.prototype.stream = function(callback) {

      var client = this.createClient(this.port, this.host),
         headers = process.mixin({}, this.headers),
            node = this
      headers['Host'] = this.host
      if (this.user)
        headers['Authorization'] = this.basicAuth(this.user, this.password)

      client.request("GET", this.requestUrl(), headers)
        .finish(function(resp) {
          resp.setBodyEncoding("utf8");
          resp.addListener('body', function(chunk) {
            // fires provided callback
            callback(JSON.parse(chunk))

          })
        })

!SLIDE javascript smaller

# Using Attempt #3 #

    @@@ javascript
    // setup Twitter Stream API options
    var twit = new TwitterNode({
      user: 'user', 
      password: 'pass'})

    twit.stream(function(tweet) {
      sys.exec("say " + tweet.text)
    })

!SLIDE javascript smaller

# Using Attempt #3 #

    @@@ javascript

    var twit = new TwitterNode({
      user: 'user', 
      password: 'pass'})
    // pass callback to be executed on incoming tweet
    twit.stream(function(tweet) {
      sys.exec("say " + tweet.text)
    })

!SLIDE bullets incremental

# What's Wrong? #

* <s>Not asynchronous</s>
* <s>Closes HTTP connection</s>
* <s>Requires Twitter Stream API knowledge</s>
* <s>No encapsulation, hard codes 'say' command</s>

!SLIDE center

# DONE! #

![shipped!](shipped.jpg)

!SLIDE center

# Okay, not really #

![boom](boom.jpg)

!SLIDE bullets smaller

# Okay, not really #

* Streams also contain status deletion notices.  
* { "delete": { "status": { "id": 1234, "user_id": 3 } } }
* Track streams may also contain limitation notices  
* { "limit": { "track": 1234 } }


Cracking an egg of knowledge about [the Twitter Streaming API](http://apiwiki.twitter.com/Streaming-API-Documentation#ParsingResponses):

!SLIDE javascript smaller

# How about callbacks? #

    @@@ javascript
    twit.stream(tweetCallback, deleteCallback, limitCallback)

    twit.stream(function(tweet) {
    }, function(delete) {

    }, function(limit) {

    });

!SLIDE javascript smaller

# Yuck, how about events? #

    @@@ javascript
    twit.addListener('tweet', function(tweet) {

    })
    twit.addListener('delete', function(delete) {

    })
    twit.addListener('limit', function(limit) {

    })

!SLIDE bullets incremental

# Advantages #

* Add event listeners at any point in the lifetime of the `twit` object.
* Add multiple listeners for the same event.
* Easily ignore events you don't care about.

!SLIDE javascript smaller

# Inherit from EventEmitter

    @@@ javascript
    sys.inherits(TwitterNode, process.EventEmitter)

    // now, TwitterNode objects have these methods:
    twit.addListener(event, listener)

    twit.removeListener(event, listener)

    twit.listeners(event)

    twit.emit(event, *args)

!SLIDE javascript smaller

# Sample #

    @@@ javascript
    var sys = require('sys')
    var TwitterNode = require('./lib').TwitterNode
    // you can pass args to create() or set them on the TwitterNode instance
    var twit = new TwitterNode({
      user: 'user', 
      password: 'password',
      track: ['toyota']})

    twit
      .addListener('tweet', function(tweet) {
        // debug STDOUT message
        sys.puts("@" + tweet.user.screen_name + ": " + tweet.text)
      })

      .addListener('tweet', function(tweet) {
        // store in queue for future processing
      })

      .stream()

!SLIDE javascript smaller

# What happened to `this`? #

    @@@ javascript
    TwitterNode.prototype.stream = function() {
      var client = this.createClient(this.port, this.host),
         headers = process.mixin({}, this.headers),
            node = this


      client.request("GET", this.requestUrl(), headers)
        .finish(function(resp) {
          resp.addListener('body', function(chunk) {



            var tweet = JSON.parse(chunk)
            node.emit('tweet', tweet)
          })
        })

!SLIDE javascript smaller

# What happened to `this`? #

    @@@ javascript
    TwitterNode.prototype.stream = function() {
      var client = this.createClient(this.port, this.host),
         headers = process.mixin({}, this.headers),
            node = this
      // this = the TwitterNode instance
      // var node = this
      client.request("GET", this.requestUrl(), headers)
        .finish(function(resp) {
          resp.addListener('body', function(chunk) {



            var tweet = JSON.parse(chunk)
            node.emit('tweet', tweet)
          })
        })

!SLIDE javascript smaller

# What happened to `this`? #

    @@@ javascript
    TwitterNode.prototype.stream = function() {
      var client = this.createClient(this.port, this.host),
         headers = process.mixin({}, this.headers),
            node = this


      client.request("GET", this.requestUrl(), headers)
        .finish(function(resp) {
          resp.addListener('body', function(chunk) {
            // this == the http request object
            // we want to access the TwitterNode instance, 
            // so use node instead
            var tweet = JSON.parse(chunk)
            node.emit('tweet', tweet)
          })
        })

!SLIDE javascript smaller

# Now, Emit Some Events #

    @@@ javascript
    client.request("GET", this.requestUrl(), headers)
      .finish(function(resp) {
        resp.setBodyEncoding("utf8");
        resp.addListener('body', function(chunk) {
          var tweet = JSON.parse(chunk)
          if(tweet.limit) {
            node.emit('limit', tweet.limit)
          } else if(tweet['delete']) {
            node.emit('delete', tweet['delete'])
          } else {
            node.emit('tweet', tweet)
          }
        })
      })