define(['backbone', '../models/ressource'], function(Backbone, Ressource){

    return Backbone.Collection.extend({

        initialize : function (models, options) {
            this.uri = options.ressource.uri;
            this.model = Ressource.extend(options.ressource);
        },

        category_id : undefined,

        url : function () {
            if (this.category_id) {
                return './'+this.uri+'/category/'+this.category_id;
            } else {
                return './'+this.uri;
            }
        },

        setCategoryId : function (id) {
            if (id != this.category_id) {
                this.category_id = id;
                this.fetch();
            }
            return this;
        }
    });
});
