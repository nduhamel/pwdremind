define([
    'backbone',
    'sandbox',
    'text!../tpl/base.html',
], function(Backbone, sandbox, baseTpl){

    return Backbone.View.extend({

        initialize : function () {
            sandbox.require(['passwordCategories',
                             'noteCategories',
                            ],function(passwordsCat,
                                       notesCat){
                console.log(passwordsCat);
                console.log(notesCat);
                });
        },

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
