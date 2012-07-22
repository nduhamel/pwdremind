define(['backbone'], function(Backbone){

    var Router = Backbone.Router.extend({

        routes: {
            "passwords/category/:id": "getPasswords"
        },

        getPasswords: function( id ) {
            console.log( "Get passwords in category " + id );
        }

    });

    return Router;

});
