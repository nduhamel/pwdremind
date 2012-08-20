define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    return sandbox.WidgetView.extend({

        appendToEl : 'header',

        events : {
            "click a" : 'onAction',
        },

        dataStyle : {
            password : {label: 'Passwords', icon: 'icon-briefcase'},
            note : {label: 'Notes', icon: 'icon-pencil'}
        },

        logged : false,

        initialize : function () {
            sandbox.on('login', this.onLogin, this);
            sandbox.on('logout', this.onLogout, this);
            sandbox.on('startApp', this.render, this);
        },

        render : function() {
            var apps = sandbox.getApps();
            var currentApp = sandbox.getCurrentApp();
            var mainMenu = _.pick(apps, _.reject(_.keys(apps), function(v){
                    return v === 'master';
                }
            ));
            mainMenu = _.map(mainMenu, function(opt, context){
                opt.name = context;
                return opt;
            })
            mainMenu = _.sortBy(mainMenu, function(entry){
                return entry.order;
            })

            var masterApp = apps.master;
            var renderedContent = _.template(baseTpl, {
                logged: this.logged,
                menu: mainMenu,
                apps: apps,
                current: currentApp,
                masterApp: masterApp,
            });
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
                sandbox.trigger('request:'+action);
            }
            var app = $(event.currentTarget).data('app');
            var context = $(event.currentTarget).data('context');
            if (app) {
                sandbox.startApp(app);
            } else if (context) {
                sandbox.setContext(context, true);
            }
        },

        onDestroy : function () {
            sandbox.off('login', this.onLogin, this);
            sandbox.off('logout', this.onLogout, this);
        }

    });

});
