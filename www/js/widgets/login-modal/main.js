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

            sandbox.broadcast('request:login', username, password);
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

    sandbox.defineWidget('LoginModal', function(){
        var view;

        return {
            meta : {startOn: 'bootstrap', stopOn: 'login:after'},

            start : function () {
                view = new LoginModal();
                view.render();
                sandbox.subscribe('login:failed', view.onError, view);
            },

            stop : function () {
                if (view) {
                    view.destroy();
                }
                sandbox.unsubscribe('login:failed', view.onError);
                delete view;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
