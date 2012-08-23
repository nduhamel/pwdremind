define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
    'backbone_forms'
], function($, _, Backbone, sandbox, baseTpl){

    return sandbox.WidgetView.extend({

        appendToEl : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel",
        },

        initialize : function (options) {
            if (options && options.label) {
                this.label = options.label
            }
            // If not new save attributes for cancel
            if (!this.model.isNew()) {
                this._revertAttributes = this.model.toJSON();
            }
            console.log(this.model);
        },

        render : function() {
            this.form = new Backbone.Form({
                model: this.model
            }).render();

            var renderedContent = _.template(baseTpl,{
                titleLabel: this.label || this.model.isNew ? 'Add' : 'Edit',
                cancelLabel: "Cancel",
                saveLabel: "Save"
            });
            this.$el.html(renderedContent);
            this.$('.modal-body').append(this.form.el);

            this.$('#add-modal').modal({
                show: true,
                backdrop: 'static',
                keyboard: false,
            })

            return this;
        },

        onDestroy : function () {
            this.$('#add-modal').modal('hide');
        },

        onSubmit : function (event) {
            event.preventDefault();

            if (this.form.validate() === null) {
                this.form.commit();
                if (!this.model.isNew()) {
                    this.model.previousServerAttr = this._revertAttributes;
                    sandbox.trigger('ressource:'+this.model.uri+':update',
                                    this.model.previousServerAttr,
                                    this.model.toJSON(),
                                    { keepInHistory: true}
                    );
                } else {
                    sandbox.trigger('ressource:'+this.model.uri+':create', this.model);
                }
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

});
