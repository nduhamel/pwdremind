define([
    'underscore',
    'backbone',
    'sandbox',
    './collections/categories'
], function(_, Backbone, sandbox, Categories){

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
        keepInHistory : true,
        historyLabel: 'site'
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
        crypted : ['name', 'notes'],
        keepInHistory : true,
        historyLabel: 'name'
    };

    sandbox.defineModule({

        name : 'ressources',

        provide : ['passwordCategories', 'noteCategories'],

        start : function () {
            this.passwordCategories = new Categories(null,{ressource:Password});
            this.noteCategories = new Categories(null,{ressource:Note});
            sandbox.on('ressource:password:delete', this.passwordCategories.destroyRessource, this.passwordCategories);
            sandbox.on('ressource:note:delete', this.noteCategories.destroyRessource, this.noteCategories);
            sandbox.on('ressource:password:create', this.passwordCategories.createRessource, this.passwordCategories);
            sandbox.on('ressource:note:create', this.noteCategories.createRessource, this.noteCategories);

        },

        stop : function () {
            sandbox.off(null, null, this.passwordCategories);
            sandbox.off(null, null, this.noteCategories);

            this.passwordCategories = null;
            this.noteCategories = null;
        },

    });

});
