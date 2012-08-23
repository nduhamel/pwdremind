define([
    'underscore',
    'backbone',
    'sandbox',
    './collections/categories'
], function(_, Backbone, sandbox, Categories){

    var Password = {
        uri : 'password',

        schema : {
            site : {
                validators: ['required', 'url']
            },
            login : {
                title: 'Username',
                validators: ['required']
            },
            pwd : {
                type: 'Password',
                validators: ['required'],
                title : "Password"
            },
            category_id : {
                title: 'Category',
                validators: ['required'],
                type: 'Select',
                options: function(callback) {
                    sandbox.trigger('ressource:get', this.uri, callback)
                }
            },
            note : {
                type: 'TextArea'
            }
        },
        crypted : ['site', 'login', 'pwd', 'notes'],
        keepInHistory : true,
        historyLabel: 'site'
    };

    var Note = {
        uri : 'note',
        schema : {
            name : {
                validators: ['required']
            },
            note : {
                type: 'TextArea',
                validators: ['required']
            },
            category_id : {
                title: 'Category',
                validators: ['required'],
                type: 'Select',
                options: function(callback) {
                    sandbox.trigger('ressource:get', this.uri, callback)
                }
            }
        },
        crypted : ['name', 'note'],
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

            },this);

            sandbox.on('ressource:get', function(uri, callback){
                callback(this.ressources[uri]);
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
