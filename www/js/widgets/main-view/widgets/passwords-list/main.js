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
            console.log('Render passwords list');
            var renderedContent = _.template(baseTpl, { pwds : this.collection.toJSON() });
            $(this.el).html(renderedContent);
            return this;
        }

    });


    // Facade
    return PasswordsCollectionView;

});
