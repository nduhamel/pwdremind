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


            var availableRessources = [Password, Note];

            this.ressources = {};

            _.each(availableRessources, function(ressource){

                //New API
                this.ressources[ressource.uri] = new Categories(null,{ressource: ressource});

                //compatibility hack
                this[ressource.uri+'Categories'] = this.ressources[ressource.uri];

                //Bind 'ressource:uri:function'
                _.each(['create','update','delete'], function(channel){
                    sandbox.on(
                        'ressource:'+ressource.uri+':'+channel,
                        this.ressources[ressource.uri][channel+'Ressource'],
                        this.ressources[ressource.uri]
                    );
                },this);

                sandbox.on('ressource:get', function(uri){
                    return this.ressources[ressource.uri];
                },this);

            },this);

        },

        stop : function () {

            // unbind
            _.each(this.ressources, function(context){
                sandbox.off(null,null,context);
            },this);
            sandbox.off(null,null,this);

            this.ressources = null;
        },

    });

});
