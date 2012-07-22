define([
    'backbone',
    './categories',
    './passwords',
    'text!../tpl/base.html',
], function(Backbone, CategoriesView, PasswordsView, baseTpl){

    return Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.categoriesView = new CategoriesView({el : '#password-vizualizer-categories',
                                                      collection : this.options.categories,
                                                      currentCategory : this.options.passwords.getCategoryId() }).render();
            this.passwordsView = new PasswordsView({el : '#password-vizualizer-passwords',
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
});
