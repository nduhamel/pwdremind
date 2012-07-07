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

    //~ var onRequestPasswords = function (callback) {
        //~ callback(passwords);
    //~ };

    var onCategoriesFetched = function (categories) {
        // If no cat create default:
        if ( categories.length == 0 ) {
            console.log('No categories, create default: General');
            var cat = new Category({name:'General'});
            categories.add(cat);
            cat.save(null, { success: loadDefaultCategory, wait: true } );
        } else {
            loadDefaultCategory();
        }
    };

    var loadDefaultCategory = function () {
        console.log('loadDefaultCategory');
        // Set current category:
        current_cat = categories.at(0);
        console.log(current_cat.id);
        // Load passwords:
        current_cat.passwords.fetch();

        // Subscribe to request:
        //~ sandbox.subscribe('request_passwords', onRequestPasswords);
    };


    // Facade
    return {
        initialize : function () {
            console.log('Init Passwords');

            categories = new Categories();

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
