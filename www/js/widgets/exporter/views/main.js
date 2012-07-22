define([
    'backbone',
    'text!../tpl/base.html',
], function(Backbone, baseTpl){

    return Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            return this;
        },

        destroy : function () {
            this.unbind();
            this.$el.html('');
        },

    });
});
