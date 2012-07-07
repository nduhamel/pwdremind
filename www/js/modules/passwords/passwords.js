define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './models/password',
    './models/category',
    './collections/passwords',
    './collections/categories',
], function($, _, Backbone, sandbox, Password, Category, Passwords, Categories){

    var categories,
        current_cat;

    var onRequestCategories = function (callback) {
        callback(categories);
    };

    var onCategoriesFetched = function (categories) {
        // If no cat create default:
        if ( categories.length == 0 ) {
            console.log('No categories, create default: General');
            var cat = new Category({name:'General'});
            categories.add(cat);
            cat.save(null, { success: loadDefaultCategory } );
        } else {
            loadDefaultCategory();
        }
    };

    var loadDefaultCategory = function () {
        // Set current category:
        current_cat = categories.at(0);
        // Load passwords:
        current_cat.passwords.fetch();
    };


    // Facade
    return {
        initialize : function () {
            console.log('Init Passwords');

            categories = new Categories();

            // Subscribe to request:
            sandbox.subscribe('request_categories', onRequestCategories);

            // Fetch
            categories.fetch({success: onCategoriesFetched });

        },

        reload : function () {
            console.log('Reload Passwords');
            // TODO
        },

        destroy : function () {
            console.log('Destroy Passwords');
            delete passwords;
            sandbox.unsubscribe('request_passwords', onRequestPasswords);
            // TODO
        },
    };
});
