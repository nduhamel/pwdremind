define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var CategoriesCollectionView = Backbone.View.extend({

        events: {
            "click a":    "openCategory",
        },

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);
            /*---------------*/

        },

        render : function() {
            var renderedContent = _.template(baseTpl, { categories : this.collection.toJSON() });
            $(this.el).html(renderedContent);
            return this;
        },

        openCategory : function (event) {
            event.preventDefault();
            var id_cat = $(event.currentTarget).data('id');
            sandbox.broadcast('category:change', id_cat);
        },

    });

    return CategoriesCollectionView;

});
