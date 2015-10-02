var factory = function (createExecutor) {
    return function (settings) {
        return function (fn) {
            return function () {
                return new Promise(createExecutor(fn, settings));
            };
        };
    }
};

var condition = factory(function (fn, settings) {
    if (!settings || typeof settings.test !== 'function') {
        throw new Error("settings.test must be a function");
    }

    function executor(resolve, reject) {

        return fn()
            .catch(reject)
            .then(function(data){
                if (settings.test(data)) {
                    resolve(data);
                    return;
                }
                reject(new ConditionError(settings, fn, data));
            });
    }

    return executor;
});

var ConditionError = function (settings, fn, data) {
    this.message = 'Condition test failed';
    this.settings = settings;
    this.fn = fn;
    this.data = data;
};
ConditionError.prototype = Object.create(Error.prototype);

condition.ConditionError = ConditionError;

module.exports = condition;
