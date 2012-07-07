define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var PasswordsCollectionView = Backbone.View.extend({
        el : 'section',

        initialize : function() {

            /*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);
            /*---------------*/

        },

        render : function() {
            var renderedContent = _.template(baseTpl, { pwds : this.collection.toJSON() });
            $(this.el).html(renderedContent);
            return this;
        }

    });


    // Facade
    return {
        initialize : function () {
            console.log('Init Passwords List Widget');

            sandbox.broadcast('request_passwords', function(collection){
                var view = new PasswordsCollectionView({collection: collection});
                view.render();
            });

        },

        reload : function () {
            console.log('Reload Passwords List Widget');
        },

        destroy : function () {
            console.log('Destroy Passwords List Widget');
        },
    };


});
