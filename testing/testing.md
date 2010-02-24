!SLIDE center

# How do I test evented objects? #

![testing sayid for infection](testing-sayid.jpg)

!SLIDE bullets incremental

# Use a Promise #

* The simplest event-emitting object
* Only two events: `success` and `error`
* Easy way to add async functionality to a simple method
* Good for testing async functionality in sync tests

!SLIDE javascript smaller

    @@@ javascript
    // pinky-swear that a value will be provided
    var promise = new process.Promise();
    var result;
    this.twit

      .addListener('tweet', function(tweet) {
        result = tweet
        promise.emitSuccess()
      })

      .addListener('delete', function(tweet) {
        promise.emitError()
      })

      .receive('{"a":1}')

    if(!promise.hasFired) promise.wait()
    assert.equal(1, result.a)

!SLIDE javascript smaller

    @@@ javascript

    var promise = new process.Promise();
    var result;
    this.twit
      // when `tweet` is emitted, set a value and complete the promise
      .addListener('tweet', function(tweet) {
        result = tweet
        promise.emitSuccess()
      })

      .addListener('delete', function(tweet) {
        promise.emitError()
      })

      .receive('{"a":1}')

    if(!promise.hasFired) promise.wait()
    assert.equal(1, result.a)

!SLIDE javascript smaller

    @@@ javascript

    var promise = new process.Promise();
    var result;
    this.twit

      .addListener('tweet', function(tweet) {
        result = tweet
        promise.emitSuccess()
      })
      // if `delete` is emitted, the test should fail
      .addListener('delete', function(tweet) {
        promise.emitError()
      })

      .receive('{"a":1}')

    if(!promise.hasFired) promise.wait()
    assert.equal(1, result.a)

!SLIDE javascript smaller

    @@@ javascript

    var promise = new process.Promise();
    var result;
    this.twit

      .addListener('tweet', function(tweet) {
        result = tweet
        promise.emitSuccess()
      })

      .addListener('delete', function(tweet) {
        promise.emitError()
      })
      // internal method for processing incoming text
      .receive('{"a":1}')

    if(!promise.hasFired) promise.wait()
    assert.equal(1, result.a)

!SLIDE javascript smaller

    @@@ javascript

    var promise = new process.Promise();
    var result;
    this.twit

      .addListener('tweet', function(tweet) {
        result = tweet
        promise.emitSuccess()
      })

      .addListener('delete', function(tweet) {
        promise.emitError()
      })

      .receive('{"a":1}')
    // wait for the promise if it is unfulfilled.  Then check the result
    if(!promise.hasFired) promise.wait()
    assert.equal(1, result.a)