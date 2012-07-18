define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'zeroclipboard',
    'text!../tpl/passwords.html',
    'text!../tpl/password.html',
], function($, _, Backbone, sandbox, ZeroClipboard, baseTpl, rowTpl) {

    var PasswordsView = Backbone.View.extend({

        rowTemplate : _.template(rowTpl, null, { variable: 'password'}),

        events : {
            "click a[name='add']" : 'doAddModal',
            "click i[class='icon-remove']" : 'doRemove',
            "click i[class='icon-pencil']" : 'doEdit',
            "mouseover span[class='copy-username']" : 'doCopyUsername',
            "mouseover span[class='copy-password']" : 'doCopyPassword',
        },

        initialize : function() {

            /*--- binding ---*/
            this.collection.on('change', this.onChange, this);
            this.collection.on('remove', this.onRemove, this);
            this.collection.bind('add', this.onAdd, this);
            this.collection.bind('reset', this.render, this);
            /*---------------*/

            ZeroClipboard.setMoviePath( './media/ZeroClipboard.swf' );
            this.zeroclip = new ZeroClipboard.Client();
            this.zeroclip.setHandCursor( true );

        },

        render : function() {
            this.$el.html(_.template(baseTpl, {passwords : this.collection.toJSON(), rowTpl : this.rowTemplate }));
            return this;
        },

        remove : function () {
            this.$el.html('');
        },

        onChange : function (model) {
            this.$('[data-id="'+model.get('id')+'"]').replaceWith(this.rowTemplate(model.toJSON()));
        },

        onRemove : function (model) {
            this.$('[data-id="'+model.get('id')+'"]').remove();
        },

        onAdd : function (model) {
            this.$('#pwdlist tbody').prepend(this.rowTemplate(model.toJSON()));
        },

        doAddModal : function (event) {
            event.preventDefault();
            sandbox.broadcast('request:add-password');
        },

        doRemove : function (event) {
            var id = $(event.target).closest('tr').data('id');
            this.collection.get(id).destroy();
        },

        doEdit : function (event) {
            var id = $(event.target).closest('tr').data('id');
            sandbox.broadcast('request:edit-password', this.collection.get(id));
        },

        setClipboard : function (elem, text) {
            this.zeroclip.setText(text);
            if (this.zeroclip.ready) {
                this.zeroclip.reposition(elem);
            } else {
                this.zeroclip.glue(elem);
            }
        },

        doCopyUsername : function (event) {
            var id = $(event.target).closest('tr').data('id');
            var elem = event.target;
            var text = this.collection.get(id).get('login');
            this.setClipboard(elem, text);
        },

        doCopyPassword : function (event) {
            var id = $(event.target).closest('tr').data('id');
            var elem = event.target;
            var text = this.collection.get(id).get('pwd');
            this.setClipboard(elem, text);
        },

    });


    return PasswordsView;
});
