define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
], function($, _, Backbone, sandbox, baseTpl){

    var AddCategoryModal = Backbone.View.extend({

        el : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel",
        },

        render : function() {
            this.$el.append(_.template(baseTpl));
            this.setElement('#add-category-modal');

            this.$el.modal({
                show: true,
                backdrop: 'static',
                keyboard: false,
            })

            return this;
        },

        destroy : function () {
            this.$el.modal('hide');
            this.remove();
        },

        onSubmit : function (event) {
            event.preventDefault();


            // Retrive form data
            var obj = {};
            this.$('input').each(function () {
                obj[$(this).attr('name')] = $(this).val();
            })

            console.log(obj);
            this.model.set(obj);

            console.log(this.model);

            if ( this.model.isValid() ) {
                this.model.save();
                // TODO wait for saved
                this.collection.add(this.model);
                this.destroy();
            }

        },

        onCancel : function (event) {
            event.preventDefault();
            console.log('cancel');
            if (this.model.isNew()) {
                this.destroy();
            }
        },

        onError : function (model, errs) {
            _.each( _.keys(errs), function (name) {
                this.$('input[name='+name+']')
                    .closest('.control-group')
                    .addClass('error');
            }, this);
        },

    });

    var view,
        categories;

    var addCategory= function () {
        view = new AddCategoryModal({collection : categories, model : new categories.model() } );
        view.render();
    };

    // Facade
    return {
        initialize : function () {
            console.log('Init Add Category Modal Widget');

            sandbox.broadcast('request:categories', function(categoriesCollection){
                categories = categoriesCollection;
                // Subscribe to request:
                sandbox.subscribe('request:add-category', addCategory);
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
        },
    };
});
