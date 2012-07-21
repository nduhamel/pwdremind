define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'zeroclipboard',
    'text!../tpl/passwords.html',
    'text!../tpl/password.html',
], function($, _, Backbone, sandbox, ZeroClipboard, baseTpl, rowTpl) {

    function has_words(text, words) {
        words = words.split(" ");
        text = text.toLowerCase();
        for (var i=0; i < words.length; i++) {
          if (words[i].charAt(0) == '-') {
            if (text.indexOf(words[i].substr(1)) != -1) return false; // Negated word must not be in text
          } else if (text.indexOf(words[i]) == -1) return false; // Normal word must be in text
        }

        return true;
    }

    var PasswordsView = Backbone.View.extend({

        rowTemplate : _.template(rowTpl, null, { variable: 'password'}),

        events : {
            "click a[name='add']" : 'doAddModal',
            "click i[class='icon-remove']" : 'doRemove',
            "click i[class='icon-pencil']" : 'doEdit',
            "mouseover span[class='copy-username']" : 'doCopyUsername',
            "mouseover span[class='copy-password']" : 'doCopyPassword',
            "keyup .form-search" : 'onKeyup',
        },

        initialize : function() {

            /*--- binding ---*/
            this.collection.on('change', this.onChange, this);
            this.collection.on('remove', this.onRemove, this);
            this.collection.bind('add', this.onAdd, this);
            this.collection.bind('reset', this.onReset, this);
            /*---------------*/

            ZeroClipboard.setMoviePath( './media/ZeroClipboard.swf' );
            this.zeroclip = new ZeroClipboard.Client();
            this.zeroclip.setHandCursor( true );

            this.lastSearch = '';
        },

        render : function() {
            this.$el.html(_.template(baseTpl, {passwords : this.collection.toJSON(), rowTpl : this.rowTemplate }));
            return this;
        },

        destroy : function () {
            this.unbind();
            this.zeroclip = undefined;
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
                _.each(collection.toJSON(), function(password){
                    $tbody.append(rowTemplate( password));
                });
            }else{
                _.each(collection, function(password){
                    $tbody.append(rowTemplate( password.toJSON()));
                });
            }
        },

        onAdd : function (model) {
            if (this.lastSearch) {
                console.log('Check filter');
                if (has_words(model.get('site'),this.lastSearch) || has_words(model.get('login'),this.lastSearch)) {
                    console.log('Ok add ..');
                    this.$('#pwdlist tbody').prepend(this.rowTemplate(model.toJSON()));
                }
            } else {
                this.$('#pwdlist tbody').prepend(this.rowTemplate(model.toJSON()));
            }
        },

        onKeyup : function (event) {
            if (event.keyCode == 13){
                this.doSearch();
            }else{
                _.throttle(_.bind(this.doSearch, this), 500)();
            }
        },

        doSearch : function () {
            var filtered,
                phrase = this.$(".form-search input").val().toLowerCase().trim();
            if ( phrase && phrase != this.lastSearch) {
                console.log('phrase');
                this.lastSearch = phrase;
                filtered = this.collection.filter(function(model){
                    return (has_words(model.get('site'),phrase) || has_words(model.get('login'),phrase));
                });
            }else if ( !phrase && this.lastSearch){
                console.log('not phrase but previous so reset');
                this.lastSearch = '';
                filtered = this.collection;
            }else{
                console.log('no change...');
                return;
            }
            this.onReset(filtered);
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
