define(['backbone', '../models/password'], function(Backbone, Password){

    var Passwords = Backbone.Collection.extend({

        model : Password,

        category_id : null,

        initialize : function (models, args) {
            console.log('Passwords collection Constructor');
        },

        url : function () {
            if (this.category_id) {
                return './passwords/category/'+this.category_id;
            } else {
                return './passwords';
            }
        },

        setCategoryId : function (id) {
            this.category_id = id;
            this.fetch();
        },

    });

    return Passwords;
});