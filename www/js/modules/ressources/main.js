define(['backbone', 'sandbox', './collections/categories'], function(Backbone, sandbox, Categories){

    var Password = {
        uri : 'password',
        validation : {
            site : {
                required  : true,
                pattern: "url",
            },
            login : {
                required  : true,
            },
            pwd : {
                required  : true,
            },
            category_id : {
                required : true,
            },
            // TODO maxlength
            //~ notes : {},
        },
        crypted : ['site', 'login', 'pwd', 'notes'],
    };

    var Note = {
        uri : 'note',
        validation : {
            name : {
                required  : true
            },
            notes : {
                required  : true
            },
            category_id : {
                required : true
            }
        },
        crypted : ['name', 'notes']
    };


    // Facade
    return {
        initialize : function () {

            var passwordCategories = new Categories(null,{ressource:Password});
            var noteCategories = new Categories(null,{ressource:Note});

            sandbox.provide('passwordCategories', function () {return passwordCategories;});
            sandbox.provide('noteCategories', function () {return noteCategories;});
        },

        reload : function () {
            console.log('Reload Passwords');
            // TODO
        },

        destroy : function () {
            console.log('Destroy Passwords');
            delete passwords;
            // TODO
        }
    };
});
