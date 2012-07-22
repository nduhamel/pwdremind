define([
    'sandbox',
    './models/note',
    './models/category',
    './collections/notes',
    './collections/categories'
], function(sandbox, Note, Category, Notes, Categories){

    var categories, notes;

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

            categories = new Categories();
            notes = new Notes();

            sandbox.subscribe('noteCategory:change', onCategoryChange);
            sandbox.subscribe('add:note', onNoteAdded);

            sandbox.provide('noteCategories', function () {return categories;});
            sandbox.provide('notes', function () {return notes;});
            sandbox.provide('Note', function () {return Note;});

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
