define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'zeroclipboard',
    'text!../tpl/passwords.html',
], function($, _, Backbone, sandbox, ZeroClipboard, baseTpl) {

    var PasswordsView = Backbone.View.extend({

        events : {
            "click a[name='add']" : 'addModal',
            "click i[class='icon-remove']" : 'onRemove',
            "click i[class='icon-pencil']" : 'onEdit',
            "mouseover span[class='copy-username']" : 'onCopyUsername',
            "mouseover span[class='copy-password']" : 'onCopyPassword',
        },

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);
            /*---------------*/

            ZeroClipboard.setMoviePath( './media/ZeroClipboard.swf' );
            this.zeroclip = new ZeroClipboard.Client();
            this.zeroclip.setHandCursor( true );

        },

        render : function() {
            this.$el.html(_.template(baseTpl, {passwords : this.collection.toJSON() }));
            return this;
        },

        remove : function () {
            this.$el.html('');
        },

        addModal : function (event) {
            event.preventDefault();
            sandbox.broadcast('request:add-password');
        },

        onRemove : function (event) {
            var row = $(event.target).closest('tr');
            console.log(row.data('id'));
        },

        onEdit : function (event) {
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

        onCopyUsername : function (event) {
            var id = $(event.target).closest('tr').data('id');
            var elem = event.target;
            var text = this.collection.get(id).get('login');
            this.setClipboard(elem, text);
        },

        onCopyPassword : function (event) {
            var id = $(event.target).closest('tr').data('id');
            var elem = event.target;
            var text = this.collection.get(id).get('pwd');
            this.setClipboard(elem, text);
        },

    });


    return PasswordsView;
});
