define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/categories',
    './views/passwords',
    'text!./tpl/base.html',
], function($, _, Backbone, sandbox, CategoriesView, PasswordsView, baseTpl){

    var PasswordApp = Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.categoriesView = new CategoriesView({el : this.$('#password-app-categories'),
                                                      collection : this.collection}).render();
            this.passwordsView = new PasswordsView({el : this.$('#password-app-passwords'),
                                                    collection : this.collection.getRessourceCollection() }).render();
            return this;
        },

        destroy : function () {
            this.categoriesView.destroy();
            this.passwordsView.destroy();
            this.$el.html('');
        },

    });

var test;
    sandbox.defineWidget('PasswordApp', ['passwordCategories'], function(categories){
        var passwordApp;


        return {
            meta : {label : 'Passwords', icon : 'icon-briefcase', type : 'application', cat : 'master'},

            start : function (el) {
                console.log(passwordApp);
                passwordApp = new PasswordApp({el : el, collection : categories});
                passwordApp.render();
            },

            stop : function () {
                passwordApp.destroy();
                passwordApp = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });

});
