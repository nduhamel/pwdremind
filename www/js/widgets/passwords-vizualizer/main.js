define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
    './views/main',
], function($, _, Backbone, sandbox, MainView){

    sandbox.defineWidget('PasswordsVizualizer', ['passwordCategories','passwords'], function(categories, passwords){
        var passwordVizualizer;

        return {
            meta : {label : 'Vizualizer', icon : 'icon-resize-full', type : 'application', cat : 'extend'},

            start : function (el) {
                passwordVizualizer = new MainView({el : el, categories : categories, passwords : passwords});
                passwordVizualizer.render();
            },

            stop : function () {
                passwordVizualizer.destroy();
                passwordVizualizer = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });

});
