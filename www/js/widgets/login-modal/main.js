define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
], function($, _, Backbone, sandbox, baseTpl){

    var LoginModal = Backbone.View.extend({

        el : 'body',

        events : {
            "submit" : "onSubmit",
        },

        render : function() {
            var renderedContent = _.template(baseTpl);
            $(this.el).append(renderedContent);

            this.setElement('#login-modal');

            this.$el.modal({
                backdrop: 'static',
                keyboard: false,
            });

            return this;
        },

        destroy : function () {
            this.$('.alert.alert-error').hide();
            this.$('input[type="submit"]')
                .removeClass('disabled')
                .removeAttr('disabled')
                .val('connexion');
            this.$("#login-form")[0].reset();
            this.$el.modal('hide');
            this.remove();
        },

        onSubmit : function (event) {
            event.preventDefault();
            this.$('input[type="submit"]')
                .addClass('disabled')
                .attr('disabled', 'disabled')
                .val('Identification...');

            var password = this.$el.find('#password').val();
            var username = this.$el.find('#username').val();

            sandbox.broadcast('request_login', username, password);
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

    var view;

    // Facade
    return {
        initialize : function () {
            console.log('Init Login Modal Widget');

            view = new LoginModal();
            view.render();

            sandbox.subscribe('login_failed', view.onError, view);
        },

        reload : function () {
            console.log('Reload Login Modal Widget');
            destroy();
            initialize();
        },

        destroy : function () {
            console.log('Destroy Login Modal Widget');
            view.destroy();
        },
    };
});
