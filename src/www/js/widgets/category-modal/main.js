define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
    'backbone_model_binder',
    'backbone_validation'
], function($, _, Backbone, sandbox, baseTpl){

    var CategoryModal = sandbox.WidgetView.extend({

        appendToEl : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel"
        },

        initialize : function () {
            this.modelBinder = new Backbone.ModelBinder();
            // If not new save attributes for cancel
            if (!this.model.isNew()) {
                this._revertAttributes = this.model.toJSON();
            }
        },

        render : function() {

            this.$el.html(_.template(baseTpl, {isNew : this.model.isNew()}));

            this.$('.modal').modal({
                show: true,
                backdrop: 'static',
                keyboard: false
            });

            Backbone.Validation.bind(this, {forceUpdate: true});
            this.modelBinder.bind(this.model, this.el);

            return this;
        },

        onDestroy : function () {
            this.$('.modal').modal('hide');
            this.modelBinder.unbind();
            Backbone.Validation.unbind(this);
        },

        onSubmit : function (event) {
            event.preventDefault();
            if (this.model.isValid(true)) {
                var collection = this.collection;
                this.model.save(null, {success: function (model) {
                    collection.add(model);
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
        }

    });

    return CategoryModal;
});
