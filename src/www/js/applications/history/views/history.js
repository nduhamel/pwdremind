define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/base.html',
    'text!../tpl/item.html'
], function($, _, Backbone, sandbox, baseTpl, itemTpl){

    var HistoryView = Backbone.View.extend({

        itemTemplate : _.template(itemTpl, null, { variable: 'item'}),

        render : function() {
            this.$el.html(_.template(baseTpl, {
                items : this.collection.toJSON(),
                itemTpl : this.itemTemplate
            }));
            return this;
        },

        destroy : function () {
            this.$el.html('');
        },

    });

    return HistoryView;
});
