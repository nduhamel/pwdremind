define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var CategoriesCollectionView = Backbone.View.extend({
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
            var renderedContent = _.template(baseTpl, { categories : this.collection.toJSON() });
            $(this.el).html(renderedContent);
            return this;
        }

    });


    // Facade
    return {
        initialize : function () {
            console.log('Init Categories List Widget');

            sandbox.broadcast('request_categories', function(collection){
                var view = new CategoriesCollectionView({collection: collection});
                view.render();
            });
        },

        reload : function () {
            console.log('Reload Categories List Widget');
        },

        destroy : function () {
            console.log('Destroy Categories List Widget');
        },
    };


});
