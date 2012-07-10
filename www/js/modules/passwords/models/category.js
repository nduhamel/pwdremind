define(['backbone', '../collections/passwords'], function(Backbone, Passwords){

   var Category = Backbone.Model.extend({

        validate : {
            name : {
                required  : true,
            },
        },

        crypted : ['name'],

        url : './category',

        initialize : function () {
            console.log('Category Constructor');
        }

    });

    return Category;
});
