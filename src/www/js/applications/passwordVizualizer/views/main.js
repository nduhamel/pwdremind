define([
    'backbone',
    './categories',
    './passwords',
    'text!../tpl/base.html',
], function(Backbone, CategoriesView, PasswordsView, baseTpl){

    return Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.categoriesView = new CategoriesView({el : '#sidebar',
                                                      collection : this.collection,
                                                      currentCategory : this.collection.getCurrentCatId() }).render();
            this.passwordsView = new PasswordsView({el : '#content',
                                                    collection : this.collection.getRessourceCollection() }).render();
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
