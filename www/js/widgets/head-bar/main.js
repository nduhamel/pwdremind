define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var HeadBar = sandbox.WidgetView.extend({

        appendToEl : 'header',

        events : {
            "click a" : 'onAction',
        },

        logged : false,

        render : function() {
            var renderedContent = _.template(baseTpl, {logged: this.logged} );
            this.$el.html(renderedContent);
            return this;
        },

        onLogin : function () {
            this.logged = true;
            this.render();

        },

        onLogout : function () {
            this.logged = false;
            this.render();
        },

        onAction : function (event) {
            event.preventDefault();
            var action = $(event.currentTarget).attr('name');
            if (action) {
                sandbox.broadcast('request:'+action);
            }
        }

    });


    sandbox.defineWidget('HeadBar', function(){
        var view;

        return {
            meta : {startOn: 'bootstrap'},

            start : function () {
                view = new HeadBar();
                view.render();
                sandbox.subscribe('login', view.onLogin, view);
                sandbox.subscribe('logout', view.onLogout, view);
            },

            stop : function () {
                if (view) {
                    view.destroy();
                }
                sandbox.unsubscribe('login', view.onLogin);
                sandbox.unsubscribe('logout', view.onLogout)
                view = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
