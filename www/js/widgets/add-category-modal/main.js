define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
    'backbone_model_binder'
], function($, _, Backbone, sandbox, baseTpl){

    var AddCategoryModal = Backbone.View.extend({

        el : 'body',

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
            this.$el.append(_.template(baseTpl));
            this.setElement('#add-category-modal');

            this.$el.modal({
                show: true,
                backdrop: 'static',
                keyboard: false
            });

            Backbone.Validation.bind(this, {forceUpdate: true});
            this.modelBinder.bind(this.model, this.el);

            return this;
        },

        destroy : function () {
            this.$el.modal('hide');
            this.modelBinder.unbind();
            Backbone.Validation.unbind(this);
            this.unbind();
            this.remove();
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

    sandbox.defineWidget('CategoryModal', ['passwordCategories'], function(categories){
        var view;

        var addCategory= function () {
            view = new AddCategoryModal({collection : categories, model : new categories.model() } );
            view.render();
        };

        return {
            meta : {startOn: 'login:after'},

            start : function () {
                sandbox.subscribe('request:add-category', addCategory);
            },

            stop : function () {
                sandbox.unsibscribe('request:add-category',addCategory);
                if (view) {
                    view.destroy();
                }
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
