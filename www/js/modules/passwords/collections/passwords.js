define(['backbone', '../models/password'], function(Backbone, Password){

    var Passwords = Backbone.Collection.extend({
        model : Password,

        initialize : function(models, args) {
            console.log('Passwords collection Constructor');
            this.url = function() { return args.category_url + '/passwords'; };
        }
    });

    return Passwords;
});
