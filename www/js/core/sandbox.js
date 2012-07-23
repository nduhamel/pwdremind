define(['core'], function(core) {

    var sandbox = {};

    sandbox.subscribe = function (channel, callback, context) {
        core.subscribe(channel, callback, context || this);
    };

    sandbox.broadcast = function (channel) {
        core.broadcast.apply(core, arguments);
    };

    sandbox.unsubscribe = function (channel, callback) {
        core.unsubscribe(channel, callback);
    };

    sandbox.provide = function () {
        core.provide.apply(core, arguments);
    };

    sandbox.require = function () {
        core.require.apply(core, arguments);
    };

    sandbox.defineWidget = function () {
        core.defineWidget.apply(core, arguments);
    };

    sandbox.startWidget = function () {
        core.startWidget.apply(core, arguments);
    };

    sandbox.stopWidget = function () {
        core.stopWidget.apply(core, arguments);
    };

    sandbox.destroyWidget = function () {
        core.destroyWidget.apply(core, arguments);
    };

    return sandbox;

});
