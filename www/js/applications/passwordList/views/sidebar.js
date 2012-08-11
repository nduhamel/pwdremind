define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/sidebar.html'
], function($, _, Backbone, sandbox, baseTpl) {

    var SideView = Backbone.View.extend({

        events : {
            'click a' : 'onClick'
        },

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.on('change', this.render);
            this.collection.on('reset', this.render);
            this.collection.on('add', this.render);
            this.collection.on('remove', this.render);
            this.collection.on('category:changed', this.render);
            /*---------------*/

        },

        render : function() {
            this.$el.html(_.template(baseTpl, {categories : this.collection.toJSON(),
                                               currentCategory: this.collection.getCurrentCatId() }));
            return this;
        },

        destroy : function () {
            this.unbind();
            this.collection.off();
            this.$el.html('');
        },

        onClick : function (event) {
            event.preventDefault();
            var name = $(event.currentTarget).attr('name');
            if (name === 'add') {
                sandbox.broadcast('request:addPasswordCategory');
            } else {
                this.collection.setCurrentCatId(name);
            }
        }

    });


    return SideView;
});
