define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
    'backbone_forms'
], function($, _, Backbone, sandbox, baseTpl){

return CategoryModal = sandbox.WidgetView.extend({

  appendToEl : 'body',

  events : {
    "click button[type='submit']" : "onSubmit",
    "click button[type='cancel']" : "onCancel",
    "click a.close" : "onCancel"
  },

  initialize : function () {
    // If not new save attributes for cancel
    if (!this.model.isNew()) {
      this._revertAttributes = this.model.toJSON();
    }
  },

  render : function() {
    var renderedContent;
    console.log('render');

    this.form = new Backbone.Form({
      model: this.model
    }).render();

    renderedContent = _.template(baseTpl,{
      titleLabel: this.model.isNew ? 'Add' : 'Edit',
      cancelLabel: "Cancel",
      saveLabel: "Save"
    });

    this.$el.html(renderedContent);
    this.$('.modal-body').append(this.form.el);

    this.$('.modal').modal({
        show: true,
        backdrop: 'static',
        keyboard: false
    });

    return this;
  },

  onDestroy : function () {
    this.form.off();
    this.$('.modal').modal('hide');
  },

  onSubmit : function (event) {
    event.preventDefault();
    if (this.form.validate() === null) {
      this.form.commit();
      var collection = this.collection;
      this.model.save(null, {success: function (model) {
        collection.push(model);
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

});
