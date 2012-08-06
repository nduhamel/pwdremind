define(['backbone'], function(Backbone){

    return Backbone.Model.extend({

        initialize : function (attr, options) {
            this.url = './'+this.uri;
        }
    });
});
