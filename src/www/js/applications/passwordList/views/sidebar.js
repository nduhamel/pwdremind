define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/sidebar.html',
    //~ 'bootstrap_dropdown'
], function($, _, Backbone, sandbox, baseTpl) {

    var SideView = Backbone.View.extend({

        events : {
            'click ul.dropdown-menu a' : 'menuAction',
            'click a' : 'onClick',
            'click a i' : 'dropdown'
        },

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.on('change', this.render);
            this.collection.on('reset', this.render);
            this.collection.on('add', this.render);
            this.collection.on('remove', this.render);
            this.collection.on('category:changed', this.render);
            /*---------------*/

            this.dropDownOpen = null;
            $('html').on('click', _.bind(this.clearDropdown, this));

        },

        render : function() {
            this.$el.html(_.template(baseTpl, {categories : this.collection.toJSON(),
                                               currentCategory: this.collection.getCurrentCatId() }));
            return this;
        },

        destroy : function () {
            this.unbind();
            this.collection.off();
            this.$el.html('');
            $('html').off('click', _.bind(this.clearDropdown, this));
        },

        onClick : function (event) {
            event.preventDefault();
            var name = $(event.currentTarget).attr('name');
            if (name === 'add') {
                sandbox.trigger('request:add-password');
            } else {
                this.collection.setCurrentCatId(name);
            }
        },

        dropdown : function (event) {
            event.preventDefault();
            event.stopPropagation();
            var dropdown = $(event.currentTarget).closest('li');
            var isActive = dropdown.hasClass('open');
            this.clearDropdown();
            if (!isActive) dropdown.toggleClass('open')
            this.dropDownOpen = dropdown;
        },

        clearDropdown : function (event) {
            if (this.dropDownOpen !== null) {
                this.dropDownOpen.removeClass('open');
            }
        },

        menuAction : function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var name = $(event.currentTarget).attr('name');
            if (name === 'edit') {
                console.log('edit');
            } else if (name === 'remove') {
                console.log('remove');
            }
            this.clearDropdown();
        }

    });


    return SideView;
});
