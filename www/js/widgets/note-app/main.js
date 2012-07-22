define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/categories',
    './views/notes',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, CategoriesView, NotesView, baseTpl){

    var NoteApp = Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.categoriesView = new CategoriesView({el : this.$('#note-app-categories'),
                                                      collection : this.options.categories,
                                                      currentCategory : this.options.notes.getCategoryId() }).render();
            this.notesView = new NotesView({el : this.$('#note-app-notes'),
                                                    collection : this.options.notes }).render();
            return this;
        },

        destroy : function () {
            this.unbind();
            this.categoriesView.destroy();
            this.notesView.destroy();
            this.$el.html('');
        },

    });

    sandbox.defineWidget('NoteApp', ['noteCategories','notes'], function(categories, notes){
        var noteApp;

        return {
            meta : {label : 'Notes', icon : 'icon-pencil', type : 'master'},

            start : function (el) {
                noteApp = new NoteApp({el : el, categories : categories, notes : notes});
                noteApp.render();
            },

            stop : function () {
                noteApp.destroy();
                delete noteApp;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
