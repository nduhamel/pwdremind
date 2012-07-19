define(['backbone'], function(Backbone){

    var Application = Backbone.Model.extend({
    //~ Attributs:
    //~ name
    //~ label
    //~ icon class
    //~ type master, extend, setting
        defaults: {
            "type":  "extend",
        },
    });

    return Application;
});
