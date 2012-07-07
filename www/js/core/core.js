define(['radio'], function(radio){

    var obj = {};

    obj.subscribe = function (channel, callback, context) {
        radio(channel).subscribe([callback,context]);
    };

    obj.broadcast = function (channel) {
        var ch = radio(channel),
            args = Array.prototype.slice.call(arguments);
        args.shift();
        ch.broadcast.apply(ch,args);
    };

    obj.unsubscribe = function (channel, callback) {
        radio(channel).unsubscribe(callback);
    };

    obj.start = function (module) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        module.initialize.apply(module,args);
    };

    obj.stop = function (module) {
        module.destroy();
    };

    return obj;
});
