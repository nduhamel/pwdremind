define(['backbone'], function(Backbone){

    var Password = Backbone.Model.extend({
        initialize : function () {
            console.log('Password Constructor');
        }
    });

    return Password;
});
