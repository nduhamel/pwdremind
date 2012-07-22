define(['backbone', 'backbone_validation'], function(Backbone){

   var Category = Backbone.Model.extend({

        validation : {
            name : {
                required  : true
            }
        },

        crypted : ['name'],

        url : './notes/category'

    });

    return Category;
});