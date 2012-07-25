define([
    'sandbox',
    'jquery',
    'backbone',
    'sandbox',
    'text!../tpl/step3.html',
    'bootstrap_button'
], function(sandbox, $, Backbone, sandbox, baseTpl){

    return sandbox.WidgetView.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            return this;
        },

        validate : function () {
            var options = {}
            this.$('div.btn-group').each(function(i, el){
                var $el = $(el);
                options[$el.attr('name')] = $el.find('button.active').attr('name');
            });
            return options;
        },


    });
});
