define(['core', 'backbone'], function(Core, Backbone) {

    var Sandbox = function () {
        this.core = new Core;
        this.core.on('all', this._proxyCore, this);
    };

    _.extend(Sandbox.prototype, Backbone.Events, {

        require : function (dep) {
            return this.core.require(dep);
        },

        configure : function (options) {
            this.core.configure(options);
        },

        setContext : function (context) {
            this.core.setContext(context);
        },

        provide : function (name, getter) {
            this.core.provide(name, getter);
        },

        defineApp : function (App) {
            this.core.defineApp(App);
        },

        getApps : function () {
            return this.core.getApps();
        },

        getCurrentApp : function () {
            return this.core.getCurrentApp();
        },

        startApp : function (name) {
            this.core.startApp(name);
        },

        defineModule : function (Module) {
            this.core.defineModule(Module, this);
        },

        startModule : function (name, options) {
            this.core.startModule(name, options);
        },

        setAppEl : function (el) {
            this.core.setAppEl(el);
        },

        _proxyCore : function () {
            this.trigger.apply(this, arguments);
        },

        WidgetView : Backbone.View.extend({

            constructor : function (options) {
                var options = options || {};
                var appendToEl = options['appendToEl'] || this.appendToEl;
                this.cid = _.uniqueId('widget');
                this._configure(options);
                if (appendToEl) {
                    this.setElement(appendToEl);
                    this._createWrapper();
                }else{
                    this._ensureElement();
                }
                this.initialize.apply(this, arguments);
                this.delegateEvents();
            },

            _createWrapper : function () {
                var newEl = this.make("div", {"id": this.cid});
                this.$el.append(newEl);
                this.setElement(newEl);
            },

            destroy : function () {
                if (this.onDestroy) {
                    this.onDestroy();
                }
                this.remove();
            },
        }),

    });

    return new Sandbox;

});
