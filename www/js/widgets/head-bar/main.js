define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var HeadBar = Backbone.View.extend({

        logged : false,

        render : function() {
            var renderedContent = _.template(baseTpl, {logged: this.logged} );
            $('header').html(renderedContent);
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

    });

    // Facade
    return {
        initialize : function () {
            console.log('Init Head Bar Widget');
            var view = new HeadBar();
            view.render();

            sandbox.subscribe('login', view.onLogin, view);
            sandbox.subscribe('logout', view.onLogout, view);
        },

        reload : function () {
            console.log('Reload Head Bar List Widget');
        },

        destroy : function () {
            console.log('Destroy Head Bar List Widget');
            sandbox.unsubscribe('login', view.onLogin);
            sandbox.unsubscribe('logout', view.onLogout);
            delete view;
        },
    };
});
