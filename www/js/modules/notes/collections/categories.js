define(['backbone', '../models/category'], function(Backbone, Category){

    var Categories = Backbone.Collection.extend({
        model : Category,

        url : './categories',

        currentCat : 1,

        setCurrentCatId : function (id) {
            if (id != this.currentCat) {
                this.currentCat = id;
            }
            return this;
        },

        getCurrentCatId : function () {
            return this.currentCat;
        }

    });

    return Categories;
});
