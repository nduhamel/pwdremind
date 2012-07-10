define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var CategoriesCollectionView = Backbone.View.extend({

        //~ events: {
            //~ "click a":    "openCategory",
        //~ },

        render : function() {
            var renderedContent = _.template(baseTpl);
            $(this.el).html(renderedContent);
            return this;
        },

        //~ openCategory : function (event) {
            //~ event.preventDefault();
            //~ var id_cat = $(event.currentTarget).data('id');
            //~ sandbox.broadcast('category:change', id_cat);
        //~ },

    });

    return CategoriesCollectionView;

});
