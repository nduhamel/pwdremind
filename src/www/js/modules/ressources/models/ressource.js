define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        url : function () {
            return './'+this.uri;
        }
    });
});
