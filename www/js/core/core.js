define(['radio', 'underscore'], function(radio, _){

    var obj = {},
        registeredDeps = {},
        registeredWidgets = {};

    // Return deps or false if they are not available
    function getDeps (deps) {
        var missed = _.difference(deps, _.keys(registeredDeps));
        if (!_.isEmpty(missed)) {
            return false;
        }
        return _.map(_.pick(registeredDeps,deps), function(val, key){
            return val();
        });
    };

    //Check widget API must define start, stop, destroy and meta keys
    //return true if ok
    function checkWidgetAPI (widget) {
        var missed;

        if (!_.isObject(widget)) {
            throw "Invalid widget API";
        }
        missed = _.difference(['start','stop','destroy','meta'], _.keys(widget));
        if (!_.isEmpty(missed)) {
            throw "Invalid widget API";
        }
        // start stop destroy must be callable
        _.each(['start','stop','destroy'], function(func){
            if (!_.isFunction(widget[func])){
                throw "Invalid widget API";
            }
        });
        // meta must be an object
        if (!_.isObject(widget.meta)) {
            throw "Invalid widget API";
        }
        return true;
    };

    function getWidget (name) {
        if (_.include(_.keys(registeredWidgets), name)){
            return registeredWidgets[name];
        }else{
            throw 'Widget not registered';
        }
    };

    function tryIniWidget(name) {
        var deps,
            instance,
            widget = getWidget(name);

        deps = getDeps(widget.deps);

        if (deps) {
            instance = widget.callback.apply(null, deps);
            if (checkWidgetAPI) {
                widget.instance = instance;
                widget.status = 'init';
                return true
            }
        }
        return false;
    };

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

    obj.provide = function (name, callback) {
        //Name require
        if (!_.isString(name)) {
            throw "No name";
        }else if (!_.isFunction(callback)){
            throw "Callback need to be a function";
        }else if (_.include(_.keys(registeredDeps), name)){
            throw "dependency already registered";
        }

        registeredDeps[name] = callback;

        // Check for widget which can be started
    };

    obj.defineWidget = function (name, options, deps, callback) {
        var missed,
            widget = {};

        //Name require and must be unique
        if (!_.isString(name)) {
            throw "No name";
        }else if (_.include(_.keys(registeredWidgets), name)){
            throw "Name already registered"
        }

        //options is optional
        //all:
        if (_.isObject(options) && _.isArray(deps) && _.isFunction(callback)){
        //no options but deps and callback:
        } else if ( _.isArray(options) && _.isFunction(deps)) {
            console.log("no options but deps and callback");
            deps = options;
            callback = deps;
            options = {};
        //options but no deps:
        } else if (_.isObject(options) && !_.isArray(options) && _.isFunction(deps) ){
            console.log("");
            callback = deps;
            deps = [];
        //no options and no deps:
        } else if (_.isFunction(options)) {
            console.log("no options and no deps");
            callback = options;
            options = {};
            deps = [];
        } else {
            throw 'Invalid arguments';
        }

        widget = {callback:callback, deps:deps, status:'registered', instance: null, options:options};
        registeredWidgets[name] = widget;

        tryIniWidget(name);
    };

    obj.startWidget = function (name) {
        var widget = getWidget(name),
            args = _.toArray(arguments).slice(1);

        if (widget.status === 'registered') {
            if (!tryIniWidget(name)) {
                throw name+' dependences not available';
            }
        } else if (widget.status === 'started') {
            throw  name+' already started'
        }

        if (widget.status === 'init' || widget.status === 'stoped') {
            widget.instance.start.apply(widget.instance,args);
        }else {
            throw 'Unknow error';
        }
    };

    obj.stopWidget = function (name) {
        var widget = getWidget(name),
            args = _.toArray(arguments).slice(1);

        widget.stop.apply(widget,args);
    };

    obj.destroyWidget = function (name) {
        var widget = getWidget(name),
            args = _.toArray(arguments).slice(1);

        widget.destroy.apply(widget,args);
        delete registeredWidgets[name];
    };

    return obj;
});
