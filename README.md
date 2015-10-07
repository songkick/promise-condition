# promise-condition [![Build Status](https://travis-ci.org/songkick/promise-condition.svg)](https://travis-ci.org/songkick/promise-condition) [![Code Climate](https://codeclimate.com/github/songkick/promise-condition/badges/gpa.svg)](https://codeclimate.com/github/songkick/promise-condition) [![Test Coverage](https://codeclimate.com/github/songkick/promise-condition/badges/coverage.svg)](https://codeclimate.com/github/songkick/promise-condition/coverage)

Rejects a promise that fails a test condition

```js
var condition = require('promise-condition');
var rejectAbove400 = condition(function (data) { return data.status < 400; });

function fetch200(){
    return fetch('/path/to/a/http-200-ok');
}

function fetch400(){
    return fetch('/path/to/a/http-400-bad-request');
}

rejectAbove400(fetch200)()
  .then(function(response){
    // the initial fetch response
  }).catch(function(err){
    // probably won't happen here, unless /200 doesn't return a HTTP - 200
  });

rejectAbove400(fetch400)()
  .then(function(response){
    // should not happen here
  }).catch(function(err){
      // err instanceof condition.ConditionError === true
      // err === {
      //   message: 'Condition test failed',
      //   fn: fetch400,
      //   data: // the original data
      // }
  });
```

## Composition

As `promise-condition` input and output is a function returning a promise, you can compose them easily with other similar helpers ([see below](#see-also)).

In the example below, our `/data` API is a bit janky and might return HTTP 500 errors. We'll retry them twice before giving up.

```js
var promiseRetry = require('promise-retry');
var promiseCondition = require('promise-condition');

var retryTwice = promiseRetry({ retries: 2 });
var rejectAbove500 = promiseCondition(function (data) {
	return data.status < 500;
});

function fetchData() {
    // this call might return 500 sometimes
    return fetch('/data');
}

retryTwice(rejectAbove500(fetchData))().then(function(response){
  // yay !
}).catch(function(err){
  // we retried the call twice but always got 500s :(
});
```

# See also

`promise-condition` composes really well with the following promise helper:

* [`promise-retry`](https://github.com/songkick/promise-retry)
* [`promise-timeout`](https://github.com/songkick/promise-timeout)
* [`promise-condition`](https://github.com/songkick/promise-condition)
