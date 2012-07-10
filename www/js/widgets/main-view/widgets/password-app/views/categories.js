define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/categories.html',
], function($, _, Backbone, sandbox, baseTpl) {

    var CategoriesView = Backbone.View.extend({

        events : {
            'click a' : 'onClick',

        },

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);
            /*---------------*/

            this.currentCategory = this.options.currentCategory;

            sandbox.subscribe('category:changed', function(cat_id) {
                this.currentCategory = cat_id;
                this.render();
            }, this);
        },

        render : function() {
            this.$el.html(_.template(baseTpl, {categories : this.collection.toJSON(),
                                               currentCategory: this.currentCategory }));
            return this;
        },

        remove : function () {
            this.$el.html('');
        },

        onClick : function (event) {
            event.preventDefault();
            var name = $(event.currentTarget).attr('name');
            if (name === 'add') {
                sandbox.broadcast('request:add-category');
            }else{
                sandbox.broadcast('category:change', name);
            }
        },

    });


    return CategoriesView;
});
