define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/categories.html'
], function($, _, Backbone, sandbox, baseTpl) {

    var CategoriesView = Backbone.View.extend({

        events : {
            'click a' : 'onClick'
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
            this.$el.html(_.template(baseTpl, {categories : this.collection.toJSON(),
                                               currentCategory: this.collection.getCurrentCatId() }));
            return this;
        },

        destroy : function () {
            this.unbind();
            this.$el.html('');
        },

        onClick : function (event) {
            event.preventDefault();
            var name = $(event.currentTarget).attr('name');
            if (name === 'add') {
                sandbox.broadcast('request:addNoteCategory');
            } else {
                this.collection.setCurrentCatId(name);
            }
        }

    });


    return CategoriesView;
});
