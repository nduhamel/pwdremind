define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    './widgets/sidebar/main',
    './widgets/password-app/main'
], function($, _, Backbone, sandbox, baseTpl, sideBar, passwordApp){

    var MainView = Backbone.View.extend({
        el : 'section',

        render : function() {
            this.$el.html(_.template(baseTpl));

            this._$sidebar = this.$('#main-view-sidebar');
            this._$content = this.$('#main-view-content');

            return this;
        },

        setSidebar : function (sidebarView, options) {
            var options = _.extend({}, options, {el : this._$sidebar});
            this.sidebar = new sidebarView(options).render();
            return this;
        },

        setContent : function (contentView, options) {
            var options = _.extend({}, options, {el : this._$content});
            this.content = new contentView(options).render();
            return this;
        },

        remove : function () {
            this.$el.html('');
        },

    });

    var mainView;


    // Facade
    return {
        initialize : function () {
            console.log('Init Main view Widget');

            mainView = new MainView();
            mainView.render();

            mainView.setSidebar(sideBar);

            sandbox.broadcast('request:categories', function(categoriesCollection){
                sandbox.broadcast('request:passwords', function(passwordsCollection){
                    mainView.setContent(passwordApp, {categories : categoriesCollection,
                                                      passwords : passwordsCollection});
                });
            });
        },

        reload : function () {
            console.log('Reload Main view Widget');
        },

        destroy : function () {
            console.log('Destroy Main view Widget');
            mainView.remove();
            delete mainView;
        },
    };


});
