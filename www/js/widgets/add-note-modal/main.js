define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
    'backbone_model_binder'
], function($, _, Backbone, sandbox, baseTpl){

    var AddModal = Backbone.View.extend({

        el : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel"
        },

        initialize : function () {
            console.log('Init add note modal');
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
                keyboard: false
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
            Backbone.Validation.unbind(this);
            this.unbind();
            this.remove();
        },

        onSubmit : function (event) {
            event.preventDefault();
            if (this.model.isValid(true)) {
                this.model.save(null,{success: function (model) {
                    sandbox.broadcast('add:note', model);
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

    sandbox.defineWidget('NoteModal', ['noteCategories', 'Note'], function(noteCategories, Note){
        var view;

        var addNote = function () {
            view = new AddModal({collection : noteCategories, model : new Note({category_id: noteCategories.getCurrentCatId() }) } );
            view.render();
        };

        var editNote = function (note) {
            view = new AddModal({collection : noteCategories, model : note });
            view.render();
        };

        return {
            meta : {startOn: 'login:after'},

            start : function () {
                sandbox.subscribe('request:addNote', addNote);
                sandbox.subscribe('request:editNote', editNote);
            },

            stop : function () {
                sandbox.unsubscribe('request:addNote', addNote);
                sandbox.unsubscribe('request:editNote', editNote);
                if (view) {
                    view.destroy();
                }
                view = null;
            },

            destroy : function () {
                this.stop();
            }
        };
    });
});
