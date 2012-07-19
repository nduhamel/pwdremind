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

    });


    return PasswordApp;

});