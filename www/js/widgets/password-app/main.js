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

        remove : function () {
            this.$el.html('');
        },

        destroy : function () {
            this.remove();
        },

    });

    var passwordApp;

    // Facade
    return {
        initialize : function () {
            console.log('Init PasswordApp');

            sandbox.broadcast('register:application', {name : 'PasswordApp', label : 'Passwords', icon : 'icon-briefcase', type : 'master'});

            sandbox.subscribe('start:PasswordApp', function(el){
                sandbox.broadcast('request:categories', function(categoriesCollection){
                    sandbox.broadcast('request:passwords', function(passwordsCollection){
                        passwordApp = new PasswordApp({el : el, categories : categoriesCollection, passwords : passwordsCollection});
                        passwordApp.render();
                    });
                });
            });
        },

        reload : function () {
            console.log('Reload PasswordApp');
        },

        destroy : function () {
            console.log('Destroy PasswordApp');
        },
    };

});
