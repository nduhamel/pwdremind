define(['backbone', '../models/password'], function(Backbone, Password){

    var Passwords = Backbone.Collection.extend({

        model : Password,

        initialize : function(models, args) {
            console.log('Passwords collection Constructor');
            this.collection = args.collection;
        },

        url : function() {
            return './passwords' + this.collection.url().slice(1);
        },

    });

    return Passwords;
});
