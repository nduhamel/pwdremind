define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/passwords.html',
], function($, _, Backbone, sandbox, baseTpl) {

    var PasswordsView = Backbone.View.extend({

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.options.passwords.bind('change', this.render);
            this.options.passwords.bind('reset', this.render);
            this.options.passwords.bind('add', this.render);
            this.options.passwords.bind('remove', this.render);
            /*---------------*/

        },

        render : function() {
            this.$el.html(_.template(baseTpl, {passwords : this.options.passwords.toJSON() }));
            return this;
        },

        remove : function () {
            this.$el.html('');
        },

    });


    return PasswordsView;
});
