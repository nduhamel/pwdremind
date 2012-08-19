define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/base.html',
    'text!../tpl/item.html'
], function($, _, Backbone, sandbox, baseTpl, itemTpl){

    var HistoryView = Backbone.View.extend({

        events : {
            "click a.undo": "doUndo"
        },

        itemTemplate : _.template(itemTpl, null, { variable: 'item'}),

        initialize : function () {
            this.collection.on('destroy add sync', this.render, this);
        },

        render : function () {
            this.$el.html(_.template(baseTpl, {
                items : this.collection.toJSON(),
                itemTpl : this.itemTemplate
            }));
            return this;
        },

        doUndo : function (event) {
            var id = $(event.target).attr('name');
            sandbox.trigger("history:undo",id);
            event.preventDefault();
        },

        destroy : function () {
            this.undelegateEvents();
            this.collection.off(null, null, this);
            this.$el.html('');
        },

    });

    return HistoryView;
});
