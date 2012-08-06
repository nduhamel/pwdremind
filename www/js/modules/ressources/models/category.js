define(['backbone'], function(Backbone){

    return Backbone.Model.extend({

        validation : {
            name : {
                required  : true
            }
        },

        crypted : ['name'],

        initialize : function (attributes, options) {
            if (options && options.ressource) {
                this.ressource = options.ressource;
            }
            this.url = './'+this.ressource+'/category';
        }

    });
});
