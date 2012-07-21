define(['backbone', '../models/note'], function(Backbone, Note){

    var Notes = Backbone.Collection.extend({

        model : Note,

        category_id : null,

        url : function () {
            if (this.category_id) {
                return './notes/category/'+this.category_id;
            } else {
                return './notes';
            }
        },

        setCategoryId : function (id) {
            if (id != this.category_id) {
                this.category_id = id;
                this.fetch();
            }
            return this;
        },

        getCategoryId : function () {
            return this.category_id;
        }

    });

    return Notes;
});
