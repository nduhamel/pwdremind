define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/categories.html',
], function($, _, Backbone, sandbox, baseTpl) {

    var CategoriesView = Backbone.View.extend({

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.options.categories.bind('change', this.render);
            this.options.categories.bind('reset', this.render);
            this.options.categories.bind('add', this.render);
            this.options.categories.bind('remove', this.render);
            /*---------------*/

        },

        render : function() {
            console.log(this.options.categories);
            this.$el.html(_.template(baseTpl, {categories : this.options.categories.toJSON() }));
            return this;
        },

        remove : function () {
            this.$el.html('');
        },

    });


    return CategoriesView;
});
