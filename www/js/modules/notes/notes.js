define([
    'sandbox',
    './models/note',
    './models/category',
    './collections/notes',
    './collections/categories'
], function(sandbox, Note, Category, Notes, Categories){

    var categories, notes;

    var onRequestNotesCategories = function (callback) {
        callback(categories);
    };

    var onRequestNotes = function (callback) {
        callback(notes);
    };

    var onRequestNoteObject = function (callback) {
        callback(Note);
    };

    var onCategoryChange = function (category_id) {
        notes.setCategoryId(category_id);
        categories.setCurrentCatId(category_id);
        sandbox.broadcast('noteCategory:changed', category_id);
    };

    var onNoteAdded = function (note) {
        var cur_cat = notes.getCategoryId();
        if ( !cur_cat || cur_cat == note.get('category_id') ){
            notes.add(note,{at:0});
        }
    };

    var onCategoriesFetched = function (categories) {
        // If no cat create default:
        if ( categories.length == 0 ) {
            console.log('No categories, create default: General');
            var cat = new Category({name:'General'});
            categories.add(cat);
            cat.save();
        }
    };

    // Facade
    return {
        initialize : function () {
            console.log('Init Notes');

            categories = new Categories();
            notes = new Notes();

            // Subscribe to request:
            sandbox.subscribe('request:noteCategories', onRequestNotesCategories);
            sandbox.subscribe('request:notes', onRequestNotes);
            sandbox.subscribe('request:Note', onRequestNoteObject);
            sandbox.subscribe('noteCategory:change', onCategoryChange);
            sandbox.subscribe('add:note', onNoteAdded);

            // Fetch
            categories.fetch({success: onCategoriesFetched });
            notes.fetch();

        },

        reload : function () {
            console.log('Reload notes');
        },

        destroy : function () {
            console.log('Destroy notes');
            delete notes;
        }
    };
});
