define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!../tpl/sidebar.html',
    'jquery_sortable'
], function($, _, Backbone, sandbox, baseTpl) {

    var SideView = Backbone.View.extend({

        events : {
            'click ul.dropdown-menu a' : 'menuAction',
            'click a' : 'onClick',
            'click a i' : 'dropdown',
            'sortupdate' : 'onSorted'
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
            this.$(".nav").sortable({
                forcePlaceholderSize: true
            });
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
                sandbox.trigger('equest:addNote');
            } else if (name === 'addCat') {
                sandbox.trigger('request:addNoteCategory');
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
            var $el = $(event.currentTarget);
            var action = $el.attr('name');
            var catId = $el.closest('li.dropdown')
                           .find('a.dropdown-toggle').attr('name');
            var cat = this.collection.get(catId);
            if (action === 'edit') {
                sandbox.trigger('request:editNoteCategory', cat);
            } else if (action === 'remove') {
                if (cat.get('dataCount') === 0) {
                    cat.destroy();
                } else {
                    sandbox.trigger('request:errorModal', 'This category is not empty please remove passwords before');
                }
            }
            this.clearDropdown();
        },

        onSorted : function (event, data) {
            this.$('.nav li.dropdown a.dropdown-toggle').each(_.bind(function (index, el) {
                var cat = this.collection.get($(el).attr('name'));
                cat.set({'order' : index}, {silent:true});
                cat.save(null, {silent: true});
            }, this));
            this.collection.sort({silent: true});
        },

    });


    return SideView;
});
