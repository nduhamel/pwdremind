define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    'text!./tpl/base.html'
], function($, _, Backbone, sandbox, baseTpl){

    var SidebarView = Backbone.View.extend({

        initialize : function() {

            /*--- binding ---*/
            this.collection.on('change', this.render, this);
            this.collection.on('remove', this.render, this);
            this.collection.on('add', this.render, this);
            this.collection.on('reset', this.render, this);
            /*---------------*/
        },

        render : function() {
            var JSON = this.collection.toJSON();
            var master = _.filter(JSON, function (model){return model.type == 'master';});
            var extend = _.filter(JSON, function (model){return model.type == 'extend';});
            var setting = _.filter(JSON, function (model){return model.type == 'setting';});

            var renderedContent = _.template(baseTpl, {master:master, extend:extend, setting:setting});
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
                sandbox.broadcast('request:applications', function(applications){
                    sidebarView = new SidebarView({el:el,collection:applications});
                    sidebarView.render();
                });
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
