define([
    'sandbox',
    './models/password',
    './models/category',
    './collections/passwords',
    './collections/categories',
], function(sandbox, Password, Category, Passwords, Categories){

    var categories,
        passwords;

    var onCategoryChange = function (category_id) {
        passwords.setCategoryId(category_id);
        categories.setCurrentCatId(category_id);
        sandbox.broadcast('category:changed', category_id);
    }

    var onPasswordAdded = function (password) {
        var cur_cat = passwords.getCategoryId();
        if ( !cur_cat || cur_cat == password.get('category_id') ){
            passwords.add(password,{at:0});
        }
    }

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
            console.log('Init Passwords');

            categories = new Categories();
            passwords = new Passwords();

            sandbox.subscribe('category:change', onCategoryChange);
            sandbox.subscribe('add:password', onPasswordAdded);

            sandbox.provide('passwordCategories', function () {return categories;});
            sandbox.provide('passwords', function () {return passwords;});
            sandbox.provide('Password', function () {return Password;});


            // Fetch
            categories.fetch({success: onCategoriesFetched });
            passwords.fetch();

        },

        reload : function () {
            console.log('Reload Passwords');
            // TODO
        },

        destroy : function () {
            console.log('Destroy Passwords');
            delete passwords;
            // TODO
        },
    };
});
