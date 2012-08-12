define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/notes.html',
    'text!../tpl/note.html'
], function($, _, Backbone, sandbox, baseTpl, rowTpl) {


    var NotesView = Backbone.View.extend({

        rowTemplate : _.template(rowTpl, null, { variable: 'note'}),

        events : {
            "click i[class='icon-remove']" : 'doRemove',
            "click i[class='icon-pencil']" : 'doEdit'
        },

        initialize : function() {

            /*--- binding ---*/
            this.collection.on('change', this.onChange, this);
            this.collection.on('remove', this.onRemove, this);
            this.collection.bind('add', this.onAdd, this);
            this.collection.bind('reset', this.onReset, this);
            /*---------------*/

        },

        render : function() {
            this.$el.html(_.template(baseTpl, {notes : this.collection.toJSON(), rowTpl : this.rowTemplate }));
            return this;
        },

        destroy : function () {
            this.unbind();
            this.$el.html('');
        },

        onChange : function (model) {
            this.$('[data-id="'+model.get('id')+'"]').replaceWith(this.rowTemplate(model.toJSON()));
        },

        onRemove : function (model) {
            this.$('[data-id="'+model.get('id')+'"]').remove();
        },

        onReset : function (collection) {
            $tbody = this.$('tbody');
            $tbody.html('');
            var rowTemplate = this.rowTemplate;
            if (_.include(_.functions(collection),'toJSON')) {
                _.each(collection.toJSON(), function(note){
                    $tbody.append(rowTemplate( note));
                });
            }else{
                _.each(collection, function(note){
                    $tbody.append(rowTemplate( note.toJSON()));
                });
            }
        },

        onAdd : function (model) {
            this.$('#pwdlist tbody').prepend(this.rowTemplate(model.toJSON()));
        },

        doRemove : function (event) {
            var id = $(event.target).closest('tr').data('id');
            this.collection.get(id).destroy();
        },

        doEdit : function (event) {
            var id = $(event.target).closest('tr').data('id');
            sandbox.trigger('request:editNote', this.collection.get(id));
        }
    });

    return NotesView;
});
