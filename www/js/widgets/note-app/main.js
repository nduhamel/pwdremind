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

    var noteApp;

    // Facade
    return {
        initialize : function () {
            console.log('Init NoteApp');

            sandbox.broadcast('register:application', {name : 'NoteApp', label : 'Notes', icon : 'icon-pencil', type : 'master'});

            sandbox.subscribe('start:NoteApp', function(el){
                sandbox.broadcast('request:noteCategories', function(categoriesCollection){
                    sandbox.broadcast('request:notes', function(notesCollection){
                        noteApp = new NoteApp({el : el, categories : categoriesCollection, notes : notesCollection});
                        noteApp.render();
                        sandbox.subscribe('stop:NoteApp', function () {
                            noteApp.destroy();
                            delete noteApp;
                        });
                    });
                });
            });
        },

        reload : function () {
            console.log('Reload NoteApp');
        },

        destroy : function () {
            console.log('Destroy NoteApp');
        }
    };

});
