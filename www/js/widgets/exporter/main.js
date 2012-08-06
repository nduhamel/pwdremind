define([
    'underscore',
    'backbone',
    'sandbox',
    './views/main',
], function(_, Backbone, sandbox, MainView){

    sandbox.defineWidget('Exporter',['applications'], function(){
        var exporter;

        return {
            meta : {label : 'Exporter', icon : 'icon-share', type : 'application', cat : 'extend'},

            start : function (el) {
                exporter = new MainView({appendToEl : el});
                exporter.render();
            },

            stop : function () {
                exporter.destroy();
                exporter = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });
});
