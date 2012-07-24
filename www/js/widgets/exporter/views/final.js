define([
    'backbone',
    'sandbox',
    'text!../tpl/final.html',
], function(Backbone, sandbox, baseTpl){

    return Backbone.View.extend({

        render : function() {
            this.$el.append(_.template(baseTpl));
            this.setElement('#exporter-step');
            return this;
        },

        destroy : function () {
            this.unbind();
            this.$el.remove();
        },

    });
});
