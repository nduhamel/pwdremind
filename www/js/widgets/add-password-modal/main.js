define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html',
    'bootstrap_modal',
], function($, _, Backbone, sandbox, baseTpl){

    var AddModal = Backbone.View.extend({

        el : 'body',

        events : {
            "click button[type='submit']" : "onSubmit",
            "click button[type='cancel']" : "onCancel",
            "click a.close" : "onCancel",
        },

        initialize : function (categories, password) {
            console.log('Init add modal');
            this.categories = categories;
            this.password = password;
            this.password.bind('error', this.onError, this);
        },

        render : function() {
            console.log(this.categories);
            var renderedContent = _.template(baseTpl, {categories : this.categories.toJSON() });
            this.$el.append(renderedContent);

            this.setElement('#add-modal');

            this.$el.modal({
                show: true,
                backdrop: 'static',
                keyboard: false,
            }).css({
                width: 'auto',
                'margin-left': function () {
                    return -($(this).width() / 2);
                }
            });

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
            this.$("#addentry").find('input').each(function () {
                obj[$(this).attr('name')] = $(this).val();
            })
            obj.notes = this.$('#addentryNote textarea').val();

            obj.category_id = this.$("#addentry select#category option:selected").data('id');

            // Update model
            this.password.set(obj);

            console.log(obj);
            if ( this.password.isValid() ) {
                console.log('valid');
                this.password.save();
                // TODO wait for saved
                this.destroy();
            }

        },

        onCancel : function (event) {
            event.preventDefault();
            console.log('cancel');
            if (this.password.isNew()) {
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
        categories,
        PasswordModel;

    var addPassword = function () {
        view = new AddModal(categories, new PasswordModel() );
        view.render();
    };

    var editPassword = function () {
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
