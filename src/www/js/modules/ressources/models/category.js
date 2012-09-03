define(['backbone'], function(Backbone){

    return Backbone.Model.extend({

        defaults: {
            "dataCount" : 0
        },

        schema : {
            name : {
                validators: ['required']
            }
        },

        crypted : ['name', 'order'],

        initialize : function (attributes, options) {
            if (options && options.ressource) {
                this.ressource = options.ressource;
            }
        },

        url : function () {
            return './'+this.ressource+'/category';
        },

        parse : function (resp) {
            if (resp.dataCount) {
                resp.dataCount = parseInt(resp.dataCount);
            }
            return resp;
        },

        toString : function () {
            return this.get('name');
        }

    });
});
