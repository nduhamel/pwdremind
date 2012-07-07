define(['backbone', '../models/password'], function(Backbone, Password){

    var Passwords = Backbone.Collection.extend({
        model : Password,

        initialize : function(models, args) {
            console.log('Passwords collection Constructor');
            console.log(args.category_url());
            this.url = function() { return './passwords' + args.category_url(); };
        }
    });

    return Passwords;
});
