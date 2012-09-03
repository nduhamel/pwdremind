define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/sidebar',
    './views/passwords',
    'text!./tpl/base.html',
], function($, _, Backbone, sandbox, SideView, PasswordsView, baseTpl){

    var PasswordApp = Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.sideView = new SideView({el : this.$('#sidebar'),
                                            collection : this.collection}).render();
            this.passwordsView = new PasswordsView({el : this.$('#content'),
                                                    collection : this.collection.getRessourceCollection() }).render();
            return this;
        },

        destroy : function () {
            this.sideView.destroy();
            this.passwordsView.destroy();
            this.$el.html('');
        },

    });

    sandbox.defineApp({
        deps : ['passwordCategories'], // require to start
        label : 'List', // Menu label
        icon : 'icon-briefcase', // Menu icon
        context : ['password'], // Data type it handle
        name : 'passwordList',

        start : function (categories){
            this.passwordApp = new PasswordApp({el : this.$el, collection : categories});
            this.passwordApp.render();
        },

        stop : function () {
            this.passwordApp.destroy();
            delete this.passwordApp;
        },
    });

});
