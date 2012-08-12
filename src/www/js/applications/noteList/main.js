define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/sidebar',
    './views/notes',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, SideView, NotesView, baseTpl){

    var NoteApp = Backbone.View.extend({

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.sideView = new SideView({el : this.$('#sidebar'),
                                                      collection : this.collection}).render();
            this.notesView = new NotesView({el : this.$('#content'),
                                                    collection : this.collection.getRessourceCollection() }).render();
            return this;
        },

        destroy : function () {
            this.sideView.destroy();
            this.notesView.destroy();
            this.$el.html('');
        },

    });

    sandbox.defineApp({
        deps : ['noteCategories'], // require to start
        label : 'List', // Menu label
        icon : 'icon-pencil', // Menu icon
        context : ['note'], // Data type it handle
        name : 'noteList',

        start : function (categories){
            this.noteApp = new NoteApp({el : this.$el, collection : categories});
            this.noteApp.render();
        },

        stop : function () {
            this.noteApp.destroy();
            console.log(delete this.noteApp);
        },
    });

});
