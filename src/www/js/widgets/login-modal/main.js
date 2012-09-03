define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
], function($, _, Backbone, sandbox, baseTpl){

    var LoginModal = sandbox.WidgetView.extend({

        appendToEl : 'body',

        events : {
            "submit" : "onSubmit",
        },

        initialize : function () {
            sandbox.on('login:failed', this.onError, this);
        },

        render : function() {
            this.$el.html(_.template(baseTpl));
            console.log(this.$el);
            this.$('#login-modal').modal({
                backdrop: 'static',
                keyboard: false,
            });
            return this;
        },

        onDestroy : function () {
            sandbox.off('login:failed', this.onError, this);
            this.$('.alert.alert-error').hide();
            this.$('input[type="submit"]')
                .removeClass('disabled')
                .removeAttr('disabled')
                .val('connexion');
            this.$("#login-form")[0].reset();
            this.$('#login-modal').modal('hide');
        },

        onSubmit : function (event) {
            event.preventDefault();
            this.$('input[type="submit"]')
                .addClass('disabled')
                .attr('disabled', 'disabled')
                .val('Identification...');

            var password = this.$el.find('#password').val();
            var username = this.$el.find('#username').val();

            sandbox.trigger('request:login', username, password);
        },

        onError : function () {
            this.$('.alert.alert-error').show();
            this.$('input[type="submit"]')
                .removeClass('disabled')
                .removeAttr('disabled')
                .val('connexion');
            this.$("#login-form")[0].reset();
        },

    });

    return LoginModal;
});
