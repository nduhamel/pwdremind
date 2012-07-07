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

    // TODO
    sandbox.addCss = function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = './widgets/'+url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return sandbox;

});
