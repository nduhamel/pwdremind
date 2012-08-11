define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    var Applications = function () {
        this._reset();
    };

    _.extend(Applications.prototype, Backbone.Events, {

        configure : function (options) {
            _.each(options, function(opt, dataType){
                if (_.has(this._context, dataType)) {
                    _.extend(this._context[dataType], opt);
                } else {
                    this._context[dataType] = opt;
                }
            }, this);
        },

        setContext : function (context, autoStart) {
            if (_.has(this._context, context)) {
                this._curContext = context;
                if (autoStart) {
                    this.start(this._context[context].defaultApp);
                }
            } else {
                throw "Invalid context";
            }
        },

        getCurrentApp : function () {
            if (this._curApp !== null) {
                return {app : this._curApp.toJSON(), context: this._curContext};
            } else {
                return null;
            }
        },

        add : function (app) {
            this._apps.push(app);
            _.each(app.context, function(dataType){
                if (_.has(this._context, dataType)) {
                    this._context[dataType].apps.push(app);
                } else {
                    this._context[dataType]= {apps : [app]};
                }
            }, this);
            this.length++;
            this.trigger('addApp');
            return this;
        },

        setEl : function (el) {
            this._$el = (el instanceof $) ? el : $(el);
        },

        toJSON : function () {
            return JSON.parse(JSON.stringify(this._context));
        },

        registerDep : function (name, getter) {
            if (!_.isString(name)) {
                throw "Dependence's name required";
            }else if (!_.isFunction(getter)){
                throw "Dependence's getter need to be a function";
            }else if (_.include(_.keys(this._availableDeps), name)){
                throw "dependence already registered";
            }
            this._availableDeps[name] = getter;
            this._tryStart();
        },

        start : function (name) {
            if (this._$el === null) {
                throw "Can't start application's element not defined";
            }
            var app = _.find(this._apps, function(app){
                return app.name === name;
            });
            if (this._curApp !== null) {
                this.stop();
            }
            app.$el = this._$el;
            this._curApp = app;
            this._curApp.state = APP_STATE.STARTING;
            this._tryStart();
            this.trigger('startApp', app.toJSON());
        },

        stop : function () {
            this._curApp.state = APP_STATE.STOP;
            this._curApp.stop();
            this._curApp = null;
        },

        _tryStart : function () {
            // Current app is started ?
            if (this._curApp !== null && this._curApp.state === APP_STATE.STARTING){
                // Deps available ?
                var deps = this.checkDeps(this._curApp.deps);
                if (deps !== false) {
                    this._curApp.start.apply(this._curApp,deps);
                    this._curApp.state = APP_STATE.STARTED;
                }
            }
        },

        // Return deps or false
        checkDeps : function (deps) {
            if (deps === null) {
                return [];
            }else{
                var missed = _.difference(deps, _.keys(this._availableDeps));
                if (!_.isEmpty(missed)) {
                    return false;
                }
                return _.map(_.pick(this._availableDeps,deps), function(val, key){
                    return val();
                });
            }
        },

        _reset: function(options) {
            this.length = 0;
            this._context = {},
            this._currentContext = null;
            this._apps = [];
            this._curApp = null;
            this._availableDeps = {};
            this._$el = null;
        },

    });

    var BaseApp = function () {
        this.cid = _.uniqueId('app');
        this.state = APP_STATE.STOP;
    };

    var APP_STATE = {
            STOP : 0,
            STARTING : 1,
            STARTED : 2,
    };

    BaseApp.extend = Backbone.Model.extend;

    _.extend(BaseApp.prototype, {

        deps : null,

        start : function () {
        },

        stop : function () {
        },

        toJSON : function () {
            return _.pick(this, 'name', 'label', 'icon', 'context', 'state');
        }
    });

    var BaseModule = function (sandbox) {
        this.cid = _.uniqueId('module');
        this.sandbox = sandbox;
    };

    BaseModule.extend = Backbone.Model.extend;

    _.extend(BaseModule.prototype, {

        provide : null,

        start : function () {
        },

        stop : function () {
        },
    });


    var Core = function () {
        this._reset();
    };

    _.extend(Core.prototype, Backbone.Events, {

        provide : function (name, getter) {
            this._applications.registerDep(name, getter);
        },

        require : function (dep) {
            return this._applications.checkDeps([dep])[0];
        },

        defineApp : function (App) {
            App = BaseApp.extend(App);
            this._applications.add(new App);
        },

        getApps : function () {
            return this._applications.toJSON();
        },

        getCurrentApp : function () {
            return this._applications.getCurrentApp();
        },

        startApp : function (name) {
            this._applications.start(name);
        },

        defineModule : function (Module, sandbox) {
            Module = BaseModule.extend(Module);
            var mod = new Module(sandbox);
            this._modules[mod.name] = mod;
        },

        startModule : function (name, options) {
            var mod = this._modules[name];
            mod.start(options);
            if (mod.provide !== null) {
                _.each(mod.provide, function(dep, i) {
                    this.provide(dep, function(){
                        return mod[dep];
                    });
                },this)
            }
        },

        configure : function (options) {
            this._applications.setEl(options.appEl);
            this._applications.configure(options.context);
            this._applications.setContext(options.defaultContext, true);
        },

        setContext : function (context) {
            this._applications.setContext(context, true);
        },

        _reset : function () {
            this._modules = {};
            this._applications = new Applications;
            this._applications.on('all', this._onApplicationsEvent, this);
        },

        _onApplicationsEvent : function () {
            this.trigger.apply(this, arguments);
        }

    });

    return Core;
});
