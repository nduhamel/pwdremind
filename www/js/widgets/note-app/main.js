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
                                                      collection : this.collection}).render();
            this.notesView = new NotesView({el : this.$('#note-app-notes'),
                                                    collection : this.collection.getRessourceCollection() }).render();
            return this;
        },

        destroy : function () {
            this.categoriesView.destroy();
            this.notesView.destroy();
            this.$el.html('');
        },

    });

    sandbox.defineWidget('NoteApp', ['noteCategories'], function(categories){
        var noteApp;

        return {
            meta : {label : 'Notes', icon : 'icon-pencil', type : 'application', cat : 'master'},

            start : function (el) {
                noteApp = new NoteApp({el : el, collection : categories});
                noteApp.render();
            },

            stop : function () {
                noteApp.destroy();
                noteApp = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
