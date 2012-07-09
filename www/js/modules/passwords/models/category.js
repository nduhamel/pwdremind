define(['backbone', '../collections/passwords'], function(Backbone, Passwords){

   var Category = Backbone.Model.extend({

       crypted : ['name'],

        url : './category',

        initialize : function () {
            console.log('Category Constructor');
        }

    });

    return Category;
});
