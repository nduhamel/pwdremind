define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/history'
], function($, _, Backbone, sandbox, HistoryView){

    sandbox.defineApp({
        deps : ['history'],
        label : 'History',
        icon : 'icon-tasks',
        name : 'history',

        start : function (history){
            this.view = new HistoryView({
                el : this.$el,
                collection : history
            });
            this.view.render();
        },

        stop : function () {
            this.view.destroy();
            delete this.view;
        },
    });

});
