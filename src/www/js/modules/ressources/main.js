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

    sandbox.defineModule({

        name : 'ressources',

        provide : ['passwordCategories', 'noteCategories'],

        start : function () {
            this.passwordCategories = new Categories(null,{ressource:Password});
            this.noteCategories = new Categories(null,{ressource:Note});
        },

        stop : function () {
            this.passwordCategories = null;
            this.noteCategories = null;
        },

    });

});
