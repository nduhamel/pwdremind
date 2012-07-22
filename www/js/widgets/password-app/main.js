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
                                                      collection : this.options.categories,
                                                      currentCategory : this.options.passwords.getCategoryId() }).render();
            this.passwordsView = new PasswordsView({el : this.$('#password-app-passwords'),
                                                    collection : this.options.passwords }).render();
            return this;
        },

        destroy : function () {
            this.unbind();
            this.categoriesView.destroy();
            this.passwordsView.destroy();
            this.$el.html('');
        },

    });


    sandbox.defineWidget('PasswordApp', ['passwordCategories','passwords'], function(categories, passwords){
        var passwordApp;

        return {
            meta : {label : 'Passwords', icon : 'icon-briefcase', type : 'application', cat : 'master'},

            start : function (el) {
                passwordApp = new PasswordApp({el : el, categories : categories, passwords : passwords});
                passwordApp.render();
            },

            stop : function () {
                passwordApp.destroy();
                delete passwordApp;
            },

            destroy : function () {
                this.stop();
            },
        };
    });

});
