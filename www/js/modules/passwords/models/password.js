define(['backbone', 'backbone_validation'], function(Backbone){

    var Password = Backbone.Model.extend({

        url : './password',

        validation : {
            site : {
                required  : true,
                pattern: "url",
            },
            login : {
                required  : true,
            },
            pwd : {
                required  : true,
            },
            category_id : {
                required : true,
            },
            // TODO maxlength
            //~ notes : {},
        },

        crypted : ['site', 'login', 'pwd', 'notes'],

        //~ initialize : function () {
            //~ console.log('Password Constructor');
        //~ }
    });

    return Password;
});
