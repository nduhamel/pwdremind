define(['backbone', '../models/application'], function(Backbone, Application){

    var Applications = Backbone.Collection.extend({

        model : Application,

    });

    return Applications;
});
