define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/passwords.html',
], function($, _, Backbone, sandbox, baseTpl) {

    var PasswordsView = Backbone.View.extend({

        events : {
            "click a[name='add']" : 'addModal',
        },

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);
            /*---------------*/

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

    });


    return PasswordsView;
});
