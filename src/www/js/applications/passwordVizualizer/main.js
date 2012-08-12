define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/main',
], function($, _, Backbone, sandbox, MainView){

    sandbox.defineApp({
        deps : ['passwordCategories'], // require to start
        label : 'Vizualizer', // Menu label
        icon : 'icon-resize-full', // Menu icon
        context : ['password'], // Data type it handle
        name : 'passwordVizualizer',

        start : function (categories){
            this.vizualizer = new MainView({
                el : this.$el,
                collection : categories,
                passwords : categories.getRessourceCollection()
            });
            this.vizualizer.render();
        },

        stop : function () {
            this.vizualizer.destroy();
            console.log(delete this.vizualizer);
        },
    });

});
