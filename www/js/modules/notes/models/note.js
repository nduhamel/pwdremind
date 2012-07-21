define(['backbone', 'backbone_validation'], function(Backbone){

    var Note = Backbone.Model.extend({

        url : './note',

        validation : {
            name : {
                required  : true
            },
            notes : {
                required  : true
            },
            category_id : {
                required : true
            }
        },

        crypted : ['name', 'notes']

    });

    return Note;
});
