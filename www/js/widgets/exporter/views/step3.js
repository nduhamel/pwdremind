define([
    'jquery',
    'backbone',
    'sandbox',
    'text!../tpl/step3.html',
    'bootstrap_button'
], function($, Backbone, sandbox, baseTpl){

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
