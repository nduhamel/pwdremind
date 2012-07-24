define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
    'backbone_model_binder',
], function($, _, Backbone, sandbox, baseTpl){

    var AddModal = Backbone.View.extend({

        el : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel",
        },

        initialize : function () {
            console.log('Init add modal');
            this.modelBinder = new Backbone.ModelBinder();

            // If not new save attributes for cancel
            if (!this.model.isNew()) {
                this._revertAttributes = this.model.toJSON();
            }
        },

        render : function() {
            var renderedContent = _.template(baseTpl, {categories : this.collection.toJSON()});
            this.$el.append(renderedContent);

            this.setElement('#add-modal');

            this.$el.modal({
                show: true,
                backdrop: 'static',
                keyboard: false,
            })
            .css({
                width: 'auto',
                'margin-left': function () {
                    return -($(this).width() / 2);
                }
            });

            Backbone.Validation.bind(this, {forceUpdate: true});
            this.modelBinder.bind(this.model, this.el);

            return this;
        },

        destroy : function () {
            this.$el.modal('hide');
            this.modelBinder.unbind();
            Backbone.Validation.unbind(this)
            this.remove();
        },

        onSubmit : function (event) {
            event.preventDefault();

            if (this.model.isValid(true)) {
                this.model.save(null,{success: function (model) {
                    sandbox.broadcast('add:password', model);
                }});
                this.destroy();
            }

        },

        onCancel : function (event) {
            event.preventDefault();
            if (!this.model.isNew()) {
                this.model.set(this._revertAttributes);
            }
            this.destroy();
        },

    });


    sandbox.defineWidget('PasswordModal', ['passwordCategories', 'Password'], function(categories, PasswordModel){
        var view;

        var addPassword = function () {
            view = new AddModal({collection : categories, model : new PasswordModel({category_id: categories.getCurrentCatId() }) } );
            view.render();
        };

        var editPassword = function (password) {
            view = new AddModal({collection : categories, model : password });
            view.render();
        };


        return {
            meta : {startOn: 'login:after'},

            start : function () {
                sandbox.subscribe('request:add-password', addPassword);
                sandbox.subscribe('request:edit-password', editPassword);
            },

            stop : function () {
                sandbox.unsubscribe('request:add-password', addPassword);
                sandbox.unsubscribe('request:edit-password', editPassword);
                if (view) {
                    view.destroy();
                }
                view = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
