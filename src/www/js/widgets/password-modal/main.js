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

    var PasswordModal = sandbox.WidgetView.extend({

        appendToEl : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel",
        },

        initialize : function () {
            this.modelBinder = new Backbone.ModelBinder();
            // If not new save attributes for cancel
            if (!this.model.isNew()) {
                this._revertAttributes = this.model.toJSON();
            }
        },

        render : function() {
            var renderedContent = _.template(baseTpl, {categories : this.collection.toJSON()});
            this.$el.html(renderedContent);

            this.$('#add-modal').modal({
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

        onDestroy : function () {
            this.$('#add-modal').modal('hide');
            this.modelBinder.unbind();
            Backbone.Validation.unbind(this)
        },

        onSubmit : function (event) {
            event.preventDefault();
            var collection = this.collection;
            if (this.model.isValid(true)) {
                if (!this.model.isNew()) {
                    this.model.previousServerAttr = this._revertAttributes;
                }
                this.model.save(null,{success: function (model) {
                    collection.addRessource(model);
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

    return PasswordModal;
});
