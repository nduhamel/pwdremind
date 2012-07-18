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
            this.unbind();
            this.remove();
        },

        onSubmit : function (event) {
            event.preventDefault();

            if (this.model.isValid(true)) {
                this.model.save();
                sandbox.broadcast('add:password', this.model);
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

    var view,
        categories,
        PasswordModel;

    var addPassword = function () {
        view = new AddModal({collection : categories, model : new PasswordModel({category_id: categories.getCurrentCatId() }) } );
        view.render();
    };

    var editPassword = function (password) {
        view = new AddModal({collection : categories, model : password });
        view.render();
    };


    // Facade
    return {
        initialize : function () {
            console.log('Init Add Modal Widget');

            sandbox.broadcast('request:categories', function(categoriesCollection){
                sandbox.broadcast('request:Password', function(Password){
                    categories = categoriesCollection;
                    PasswordModel = Password;
                    // Subscribe to request:
                    sandbox.subscribe('request:add-password', addPassword);
                    sandbox.subscribe('request:edit-password', editPassword);
                });
            });

        },

        reload : function () {
            console.log('Reload Add Modal Widget');
            destroy();
            initialize();
        },

        destroy : function () {
            console.log('Destroy Add Modal Widget');
            if (view) {
                view.destroy();
            }
            view = null;
            categories = null;
            PasswordModel = null;
        },
    };
});
