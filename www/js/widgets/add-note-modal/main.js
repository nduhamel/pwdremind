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
            console.log('Submitted');
            console.log(this.model);
            console.log(this.model.isValid(true));
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

    var view,
        categories,
        NoteModel;

    var addNote = function () {
        view = new AddModal({collection : categories, model : new NoteModel({category_id: categories.getCurrentCatId() }) } );
        view.render();
    };

    var editNote = function (note) {
        view = new AddModal({collection : categories, model : note });
        view.render();
    };


    // Facade
    return {
        initialize : function () {
            console.log('Init Add Note Modal Widget');

            sandbox.broadcast('request:noteCategories', function(categoriesCollection){
                sandbox.broadcast('request:Note', function(Note){
                    categories = categoriesCollection;
                    NoteModel = Note;
                    // Subscribe to request:
                    sandbox.subscribe('request:add-note', addNote);
                    sandbox.subscribe('request:edit-note', editNote);
                });
            });

        },

        reload : function () {
            console.log('Reload Add Note Modal Widget');
            destroy();
            initialize();
        },

        destroy : function () {
            console.log('Destroy Add Note Modal Widget');
            if (view) {
                view.destroy();
            }
            view = null;
            categories = null;
            NoteModel = null;
        }
    };
});
