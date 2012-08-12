define([
    'underscore',
    'backbone',
    'sandbox',
    './views/main',
], function(_, Backbone, sandbox, MainView){

    sandbox.defineApp({
        label : 'Exporter', // Menu label
        icon : 'icon-share', // Menu icon
        context : ['password', 'note'], // Data type it handle
        name : 'exporter',

        start : function (categories){
            this.exporter = new MainView({appendToEl : this.$el});
            this.exporter.render();
        },

        stop : function () {
            this.exporter.destroy();
            console.log(delete this.exporter);
        },
    });
});
