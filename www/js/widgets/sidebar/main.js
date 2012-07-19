define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var SidebarView = Backbone.View.extend({

        render : function() {
            var renderedContent = _.template(baseTpl);
            this.$el.html(renderedContent);
            return this;
        },

    });

    var sidebarView;

    // Facade
    return {
        initialize : function () {
            console.log('Init SidebarView');

            sandbox.subscribe('start:SidebarView', function(el){
                sidebarView = new SidebarView({el:el});
                sidebarView.render();
            });
        },

        reload : function () {
            console.log('Reload SidebarView');
        },

        destroy : function () {
            console.log('Destroy SidebarView');
        },
    };

});
