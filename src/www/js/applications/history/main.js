define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
], function($, _, Backbone, sandbox){

    sandbox.defineApp({
        deps : ['history'],
        label : 'History',
        icon : 'icon-tasks',
        name : 'history',

        start : function (history){
            console.log(history);
        },

        stop : function () {

        },
    });

});
