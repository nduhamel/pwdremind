define(['backbone', '../collections/passwords'], function(Backbone, Passwords){

   var Category = Backbone.Model.extend({

        urlRoot : './category',

        initialize : function () {
            console.log('Category Constructor');
            this.passwords = new Passwords([], {category_url: this.url() });
        }

    });

    return Category;
});
