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

    var passwords,
        categories,
        current_cat;

    var onRequestPasswords = function (callback) {
        callback(passwords);
    };


    // Facade
    return {
        initialize : function () {
            console.log('Init Passwords');

            categories = new Categories();

            categories.fetch({success: function (categories) {

                // If no cat create default:
                if ( categories.length == 0 ) {
                    console.log('No categories, create default: General');
                    var cat = new Category({name:'General'});
                    cat.save();
                    categories.add(cat);
                }

                // Set current category:
                current_cat = categories.at(0);

                // Load passwords:
                current_cat.passwords.fetch();

                // Subscribe to request:
                sandbox.subscribe('request_passwords', onRequestPasswords);

            }});

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
