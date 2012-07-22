define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var SidebarView = Backbone.View.extend({

        events : {
            "click a" : 'onClick',
        },

        initialize : function() {

            /*--- binding ---*/
            this.collection.on('change', this.render, this);
            this.collection.on('remove', this.render, this);
            this.collection.on('add', this.render, this);
            this.collection.on('reset', this.render, this);
            /*---------------*/

            this.startedAppName = null;
        },

        render : function() {
            var JSON = this.collection.toJSON();
            var master = _.filter(JSON, function (model){return model.type == 'master';});
            var extend = _.filter(JSON, function (model){return model.type == 'extend';});
            var setting = _.filter(JSON, function (model){return model.type == 'setting';});

            var renderedContent = _.template(baseTpl, {master:master, extend:extend, setting:setting});
            this.$el.html(renderedContent);

            if (this.startedAppName === null) {
                this.startApp();
            }
            return this;
        },

        startApp : function (appName) {
            if (appName === undefined) {
                appName = this.collection.at(0).get('name');
            }
            if (this.startedAppName !== null) {
                if (this.startedAppName === appName) {
                    return;
                } else {
                    sandbox.broadcast('stop:'+this.startedAppName);
                    this.$('a[name="'+this.startedAppName+'"]').closest('li').removeClass("active");
                }
            }
            sandbox.broadcast('start:'+appName,'#main-view-content');
            this.$('a[name="'+appName+'"]').closest('li').addClass("active");
            this.startedAppName = appName;
        },

        onClick : function (event) {
            var appName = $(event.target).attr('name');
            this.startApp(appName);
        },

    });

    sandbox.defineWidget('Sidebar', ['applications'], function(applications){
        var sidebarView;

        return {
            meta : {},

            start : function (el) {
                sidebarView = new SidebarView({el:el,collection:applications});
                sidebarView.render();
            },

            stop : function () {
                sidebarView.destroy();
                delete sidebarView;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
