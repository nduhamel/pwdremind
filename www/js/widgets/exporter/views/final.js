define([
    'sandbox',
    'backbone',
    'sandbox',
    'text!../tpl/final.html',
], function(sandbox, Backbone, sandbox, baseTpl){

    return sandbox.WidgetView.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            return this;
        },

    });
});
