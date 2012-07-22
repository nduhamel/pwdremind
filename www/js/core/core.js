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
            if (checkWidgetAPI(instance)) {
                console.log('Init: '+name);
                widget.instance = instance;
                widget.status = 'init';
                if (_.has(instance.meta, 'startOn')){
                    obj.subscribe(instance.meta.startOn,function(){
                        obj.startWidget(name);
                    });
                }
                if (_.has(instance.meta, 'startAfter')){
                    obj.subscribe(instance.meta.startAfter+':after',function(){
                        obj.startWidget(name);
                    });
                }
                if (_.has(instance.meta, 'stopAfter')) {
                    obj.subscribe(instance.meta.stopAfter+':after',function(){
                        obj.stopWidget(name);
                    });
                }
                if (_.has(instance.meta, 'type') && instance.meta.type === 'application') {
                    console.log('application!!');
                    obj.broadcast('register:application', name, instance.meta);
                }
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
        ch = radio(channel+':after');
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
        _.each(registeredWidgets, function(widget, name){
            var deps;
            if (widget.status === 'registered') {
                deps = getDeps(widget.deps);
                if (deps) {
                    tryIniWidget(name);
                }
            }
        });
    };

    obj.defineWidget = function (name, deps, callback) {
        var missed,
            widget = {};

        //Name require and must be unique
        if (!_.isString(name)) {
            throw "No name";
        }else if (_.include(_.keys(registeredWidgets), name)){
            throw "Name already registered"
        }

        //This module may not have dependencies
        if (!_.isArray(deps)) {
            callback = deps;
            deps = [];
        }

        widget = {callback:callback, deps:deps, status:'registered', instance: null};
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

        widget.instance.stop.apply(widget,args);
        widget.status = 'stoped';
    };

    obj.destroyWidget = function (name) {
        var widget = getWidget(name),
            args = _.toArray(arguments).slice(1);

        widget.destroy.apply(widget,args);
        delete registeredWidgets[name];
    };

    return obj;
});
