define(['backbone', 'backbone_validations'], function(Backbone){

    var Password = Backbone.Model.extend({

        url : './password',

        validate : {
            site : {
                required  : true,
                type: "url",
            },
            login : {
                required  : true,
            },
            pwd : {
                required  : true,
            },
            category_id : {
                required : true,
                type: "number",
            },
            // TODO maxlength
            //~ notes : {},
        },

        crypted : ['site', 'login', 'pwd', 'notes'],

        initialize : function () {
            console.log('Password Constructor');
        }
    });

    return Password;
});
