define(['backbone', '../models/category'], function(Backbone, Category){

    var Categories = Backbone.Collection.extend({
        model : Category,

        url : './categories',

        initialize : function() {
            console.log('Categories collection Constructor');
        }
    });

    return Categories;
});
