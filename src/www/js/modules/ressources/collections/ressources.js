define(['backbone', '../models/ressource'], function(Backbone, Ressource){

    return Backbone.Collection.extend({

        initialize : function (models, options) {
            this.uri = options.ressource.uri;
            this.model = Ressource.extend(options.ressource);
            this.categories = options.categories;
        },

        category_id : undefined,

        url : function () {
            if (this.category_id) {
                return './'+this.uri+'/category/'+this.category_id;
            } else {
                return './'+this.uri;
            }
        },

        reset : function (models, options) {
            this.category_id = undefined;
            Backbone.Collection.prototype.reset.call(this, models, options);
            return this;
        },

        setCategoryId : function (id, options) {
            if (id != this.category_id) {
                this.category_id = id;
                if (!options || !options.noFetch ) {
                    this.fetch();
                }
            }
            return this;
        },
    });
});
