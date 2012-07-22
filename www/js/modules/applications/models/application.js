define(['backbone'], function(Backbone){

    var Application = Backbone.Model.extend({
    //~ Attributs:
    //~ name
    //~ label
    //~ icon class
    //~ cat master, extend, setting
        defaults: {
            "cat":  "extend",
        },
    });

    return Application;
});
