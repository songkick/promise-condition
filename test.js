var tap = require('tap');
var condition = require('./index');

tap.test('throws when no settings or test function specified', function (t) {

    t.plan(2);

    function success() {
        return Promise.resolve('success');
    }

    t.throws(condition()(success));
    t.throws(condition({})(success));

});

function createResponse(status) {
    return {
        status: status
    };
}

function test(data) {
    return data.status === 'ok';
}

tap.test('resolves when condition is truthy', function (t) {

    t.plan(1);

    var response = createResponse('ok');

    function belowStatus() {
        return Promise.resolve(response);
    }

    condition({test: test})(belowStatus)().then(function (result) {
        t.equal(result, response, 'result should be original promise result');
    }).catch(function (err) {
        t.bailout('the promise was unexpectedly rejected');
    });

});

tap.test('rejects when condition is falsy', function (t) {

    t.plan(4);

    var response = createResponse('not good!');

    function aboveStatus() {
        return Promise.resolve(response);
    }

    condition({test:test})(aboveStatus)().then(function (res) {
        t.bailout('the promise was unexpectedly resolved');
    }).catch(function (error) {
        t.ok(error instanceof condition.ConditionError, 'error should be instance of ConditionError');
        t.equal(error.fn, aboveStatus, 'initial functon was not returned');
        t.equal(error.message, 'Condition test failed', 'wrong error message');
        t.equal(error.data, response, 'initial response was not returned');
    });

});

tap.test('forward error if promise rejects', function (t) {

    t.plan(1);

    var expectedError = {
        something: 'went wrong'
    };

    function willReject() {
        return Promise.reject(expectedError);
    }

    condition({test:test})(willReject)().then(function (res) {
        t.bailout('the promise was unexpectedly resolved');
    }).catch(function (error) {
        t.equal(error, expectedError, 'The promise was not reject with the original error');
    });

});
